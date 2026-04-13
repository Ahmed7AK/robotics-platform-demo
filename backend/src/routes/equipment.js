const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/v1/equipment
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM equipment');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/equipment/requests (student)
router.post('/requests', requireAuth, async (req, res) => {
  const { equipment_id, quantity } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO equipment_requests (user_id, equipment_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, equipment_id, quantity]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/equipment/requests (admin - all, student - theirs)
router.get('/requests', requireAuth, async (req, res) => {
  try {
    let query = `
      SELECT er.*, e.name as equipment_name, u.username, u.display_name 
      FROM equipment_requests er
      JOIN equipment e ON er.equipment_id = e.id
      JOIN users u ON er.user_id = u.id
    `;
    let params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE er.user_id = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY requested_at DESC';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/equipment/requests/:id (admin - approve/deny/return)
router.patch('/requests/:id', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body; // 'approved', 'denied', 'returned'
  try {
    await db.query('BEGIN');
    
    // Get the request
    const reqQuery = await db.query('SELECT * FROM equipment_requests WHERE id = $1', [req.params.id]);
    if (reqQuery.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    const request = reqQuery.rows[0];
    
    // Update request
    const updateQuery = status === 'returned' 
      ? 'UPDATE equipment_requests SET status = $1, resolved_at = NOW() WHERE id = $2 RETURNING *' 
      : 'UPDATE equipment_requests SET status = $1 WHERE id = $2 RETURNING *';
      
    const { rows } = await db.query(updateQuery, [status, req.params.id]);
    
    // If approved, decrement availability
    if (status === 'approved' && request.status === 'pending') {
      await db.query('UPDATE equipment SET quantity_available = quantity_available - $1 WHERE id = $2', [request.quantity, request.equipment_id]);
    }
    // If returned, increment availability
    if (status === 'returned' && request.status === 'approved') {
      await db.query('UPDATE equipment SET quantity_available = quantity_available + $1 WHERE id = $2', [request.quantity, request.equipment_id]);
    }

    await db.query('COMMIT');
    res.json(rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
