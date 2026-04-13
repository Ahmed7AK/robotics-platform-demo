const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/v1/users/me -> get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, username, display_name, avatar_url, rank, role, member_since FROM users WHERE id = $1', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/users/list -> get all users (any authenticated user, for team building)
router.get('/list', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, username, display_name, avatar_url, rank FROM users WHERE id != $1 ORDER BY display_name',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/users/:id -> get specific user
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, username, display_name, avatar_url, rank, role, member_since FROM users WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/users -> get all users (admin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, username, display_name, avatar_url, rank, role, member_since FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/users/:id/rank -> update rank (admin)
router.patch('/:id/rank', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rank } = req.body;
    const { rows } = await db.query(
      'UPDATE users SET rank = $1 WHERE id = $2 RETURNING id, username, rank',
      [rank, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
