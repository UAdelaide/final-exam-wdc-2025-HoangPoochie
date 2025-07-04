// userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // persist login so later routes can read it
    req.session.user = {
      id: rows[0].user_id,
      username: rows[0].username,
      role: rows[0].role
    };

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Get current owner’s dogs ───────────────────────────────────────
// GET /api/users/me/dogs
router.get('/me/dogs', async (req, res) => {
  const ownerId = req.session.user?.id;   // ID from the logged-in session
  if (!ownerId) return res.status(401).json({ error: 'Not authenticated' });

  const [rows] = await db.query(
    `SELECT MIN(dog_id) AS dog_id, name
      FROM Dogs
     WHERE owner_id = ?
  GROUP BY name
  ORDER BY name`,
    [ownerId]
  );

  res.json(rows);   // only that owner’s dogs
});
// ───────────────────────────────────────────────────────────────────


module.exports = router;
