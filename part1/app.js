// app.js
const express    = require('express');
const path       = require('path');
const cookieParser = require('cookie-parser');
const logger     = require('morgan');
const mysql      = require('mysql2/promise');

const app = express();

// standard middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// serve static files from public/, so public/index.html is GET /
app.use(express.static(path.join(__dirname, 'public')));

let db;
(async () => {
  try {
    // connect & create testdb
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'HoangPoochie'
    });
    await conn.query('CREATE DATABASE IF NOT EXISTS testdb');
    await conn.end();

    // reconnect into testdb
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'HoangPoochie',
      database: 'testdb'
    });

    // create & seed books table...
    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255)
      )`);
    const [rows] = await db.execute('SELECT COUNT(*) AS cnt FROM books');
    if (rows[0].cnt === 0) {
      await db.execute(`
        INSERT INTO books (title, author) VALUES
          ('1984','George Orwell'),
          ('To Kill a Mockingbird','Harper Lee'),
          ('Brave New World','Aldous Huxley')
      `);
    }
  } catch (err) {
    console.error('DB setup error:', err);
  }
})();

// JSON endpoint, *not* '/'
app.get('/api/books', async (req, res) => {
  try {
    const [books] = await db.execute('SELECT * FROM books');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
