const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'replace-with-a-secure-random-string',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Mount the auth router at /api
app.use('/api', authRoutes);

// Protect a dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.send(`Welcome ${req.session.user.username}!`);
});

// Export the app instead of listening here
module.exports = app;