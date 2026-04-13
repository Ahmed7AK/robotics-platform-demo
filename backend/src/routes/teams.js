const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/teams — list teams for the current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT t.*, p.title as project_title, p.description as project_description, p.rank_required
      FROM teams t
      JOIN projects p ON t.project_id = p.id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = $1
      ORDER BY t.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/teams/showcase — completed and evaluated projects only
router.get('/showcase', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        t.id,
        t.name,
        t.status,
        t.created_at,
        p.title AS project_title,
        p.description AS project_description,
        p.rank_required,
        s.id AS submission_id,
        s.notes,
        s.submitted_at,
        s.status AS submission_status,
        AVG(e.score)::numeric(10,2) AS avg_score,
        COUNT(e.id)::int AS evaluation_count
      FROM teams t
      JOIN projects p ON p.id = t.project_id
      JOIN submissions s ON s.team_id = t.id
      LEFT JOIN evaluations e ON e.submission_id = s.id
      WHERE t.status = 'completed'
      GROUP BY t.id, p.id, s.id
      HAVING COUNT(e.id) > 0
      ORDER BY s.submitted_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/teams/:id — get detailed team info with members
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // Get the team + project info
    const teamRes = await db.query(`
      SELECT t.*, p.title as project_title, p.description as project_description, p.rank_required
      FROM teams t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `, [req.params.id]);

    if (teamRes.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamRes.rows[0];

    // Get team members with user details
    const membersRes = await db.query(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.rank, tm.joined_at
      FROM team_members tm
      JOIN users u ON u.id = tm.user_id
      WHERE tm.team_id = $1
      ORDER BY tm.joined_at ASC
    `, [req.params.id]);

    team.members = membersRes.rows;

    const submissionRes = await db.query(`
      SELECT
        s.*,
        COALESCE(AVG(e.score), 0)::numeric(10,2) AS avg_score,
        COUNT(e.id)::int AS evaluation_count
      FROM submissions s
      LEFT JOIN evaluations e ON e.submission_id = s.id
      WHERE s.team_id = $1
      GROUP BY s.id
      ORDER BY s.submitted_at DESC
      LIMIT 1
    `, [req.params.id]);

    team.latest_submission = submissionRes.rows[0] || null;

    const hasMembership = team.members.some((m) => m.id === req.user.id);
    team.can_evaluate = !!team.latest_submission && !hasMembership;
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/teams — create a new team with members
router.post('/', requireAuth, async (req, res) => {
  const { project_id, name, member_ids = [] } = req.body;
  try {
    await db.query('BEGIN');

    // Ensure current user is in member_ids and set as leader
    const allMemberIds = [req.user.id, ...member_ids.filter(id => id !== req.user.id)];

    const teamRes = await db.query(
      `INSERT INTO teams (project_id, name, leader_id, member_ids) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [project_id, name, req.user.id, allMemberIds]
    );
    const team = teamRes.rows[0];

    // Insert all members into team_members
    for (const userId of allMemberIds) {
      await db.query(
        'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [team.id, userId]
      );
    }

    await db.query('COMMIT');
    res.json(team);
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/teams/:id/join
router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    await db.query('BEGIN');

    await db.query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
      [req.params.id, req.user.id]
    );

    // Also add to the member_ids array
    await db.query(
      'UPDATE teams SET member_ids = array_append(member_ids, $1) WHERE id = $2 AND NOT ($1 = ANY(member_ids))',
      [req.user.id, req.params.id]
    );

    await db.query('COMMIT');
    res.json({ message: 'Joined team successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/teams/:id/complete — mark team project as complete (leader only)
router.patch('/:id/complete', requireAuth, async (req, res) => {
  try {
    const teamRes = await db.query(
      'SELECT id, leader_id, status FROM teams WHERE id = $1',
      [req.params.id]
    );

    if (teamRes.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamRes.rows[0];
    if (team.leader_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the team leader can complete this project' });
    }

    if (team.status === 'completed') {
      return res.json({ message: 'Project already completed' });
    }

    const { rows } = await db.query(
      "UPDATE teams SET status = 'completed' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
