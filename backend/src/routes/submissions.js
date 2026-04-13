const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/submissions/available-evaluations
router.get('/available-evaluations', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
        s.id,
        s.team_id,
        s.project_id,
        s.submitted_at,
        s.status,
        s.notes,
        t.name AS team_name,
        p.title AS project_title,
        p.rank_required
      FROM submissions s
      JOIN teams t ON t.id = s.team_id
      JOIN projects p ON p.id = s.project_id
      WHERE s.status IN ('pending', 'failed', 'passed')
        AND NOT EXISTS (
          SELECT 1
          FROM team_members tm
          WHERE tm.team_id = s.team_id
            AND tm.user_id = $1
        )
        AND NOT EXISTS (
          SELECT 1
          FROM evaluations e
          WHERE e.submission_id = s.id
            AND e.evaluator_id = $1
        )
      ORDER BY s.submitted_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/submissions
router.post('/', requireAuth, async (req, res) => {
  const { team_id, project_id, notes } = req.body;
  try {
    const teamRes = await db.query('SELECT leader_id, status FROM teams WHERE id = $1', [team_id]);
    if (teamRes.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    if (teamRes.rows[0].leader_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the team leader can submit this project' });
    }
    if (teamRes.rows[0].status !== 'completed') {
      return res.status(400).json({ error: 'Complete the project before submitting' });
    }

    const existingSubmission = await db.query(
      'SELECT id FROM submissions WHERE team_id = $1 AND project_id = $2',
      [team_id, project_id]
    );
    if (existingSubmission.rows.length > 0) {
      return res.status(400).json({ error: 'This team already submitted this project' });
    }

    const { rows } = await db.query(
      'INSERT INTO submissions (team_id, project_id, notes) VALUES ($1, $2, $3) RETURNING *',
      [team_id, project_id, notes]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/submissions/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    const { rows } = await db.query('SELECT * FROM submissions WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/submissions/evaluations (Peer evaluator)
router.post('/evaluations', requireAuth, async (req, res) => {
  const { submission_id, score, feedback } = req.body;
  try {
    await db.query('BEGIN');
    const submissionRes = await db.query(
      `SELECT s.id, s.status, s.team_id
       FROM submissions s
       WHERE s.id = $1`,
      [submission_id]
    );

    if (submissionRes.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissionRes.rows[0];
    if (!['pending', 'failed', 'passed'].includes(submission.status)) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'This submission can no longer be evaluated' });
    }

    const membershipRes = await db.query(
      'SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2',
      [submission.team_id, req.user.id]
    );
    if (membershipRes.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(403).json({ error: 'Team members cannot evaluate their own submission' });
    }

    const existingEvalRes = await db.query(
      'SELECT 1 FROM evaluations WHERE submission_id = $1 AND evaluator_id = $2',
      [submission_id, req.user.id]
    );
    if (existingEvalRes.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'You already evaluated this submission' });
    }

    const { rows } = await db.query(
      'INSERT INTO evaluations (submission_id, evaluator_id, score, feedback) VALUES ($1, $2, $3, $4) RETURNING *',
      [submission_id, req.user.id, score, feedback]
    );
    
    // Update submission status based on score
    const status = score >= 50 ? 'passed' : 'failed'; // Assuming 50 is passing
    await db.query('UPDATE submissions SET status = $1 WHERE id = $2', [status, submission_id]);
    
    await db.query('COMMIT');
    res.json(rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
