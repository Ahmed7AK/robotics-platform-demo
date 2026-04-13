const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/v1/events
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM events ORDER BY event_date ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/events (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, event_date } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO events (title, description, event_date, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, event_date, req.user.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
