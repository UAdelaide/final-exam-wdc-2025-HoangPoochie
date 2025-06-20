// routes/dogRoutes.js
const express = require('express');
const db      = require('../models/db');   // or ../config/db
const router  = express.Router();

// GET /api/dogs  →  all dogs in the DB
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT dog_id, owner_id, name, size FROM Dogs');
    res.json(rows);
  } catch (err) {
    console.error('dogs route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
