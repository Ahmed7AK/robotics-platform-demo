const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/v1/projects -> list all projects
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM projects ORDER BY FIELD(rank_required, \'S\', \'A\', \'B\', \'C\', \'D\') DESC');
    res.json(rows);
  } catch (error) {
    // Fallback order for postgres
    try {
      const { rows } = await db.query('SELECT * FROM projects');
      res.json(rows);
    } catch(e) { res.status(500).json({ error: e.message }); }
  }
});

// GET /api/v1/projects/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/projects -> admin
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, rank_required } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO projects (title, description, rank_required) VALUES ($1, $2, $3) RETURNING *',
      [title, description, rank_required]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/projects/:id -> admin
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, rank_required, status } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE projects SET title = COALESCE($1, title), description = COALESCE($2, description), rank_required = COALESCE($3, rank_required), status = COALESCE($4, status) WHERE id = $5 RETURNING *',
      [title, description, rank_required, status, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
