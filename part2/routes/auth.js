// routes/auth.js
const express = require('express');
const pool = require('../models/db');    // your mysql2 promise pool
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 1) Basic validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // 2) Fetch the user record
    const [rows] = await pool.query(
      'SELECT user_id, username, password_hash, role FROM Users WHERE username = ?',
      [username]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3) Plain‐text compare
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 4) Store user info in session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    // 5) Tell the client which dashboard to go to
    return res.json({
      success: true,
      role: user.role   // "owner" or "walker"
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

module.exports = router;
