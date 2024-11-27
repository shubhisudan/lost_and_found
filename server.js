// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files

// PostgreSQL Connection for Lost & Found posts
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lost_and_found',
  password: 'cherry.21',
  port: 5432,
});

// PostgreSQL Connection for Users
const pool2 = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'user',
  password: 'cherry.21',
  port: 5432,
});

// Routes for posts (Lost & Found)
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving posts');
  }
});

app.post('/posts', async (req, res) => {
  const { title, description, location, contact_info, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (title, description, location, contact_info, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, location, contact_info, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding post');
  }
});

// Route to delete a post
app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    if (result.rowCount === 0) {
      return res.status(404).send('Post not found');
    }

    res.status(200).send('Post deleted');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Internal server error');
  }
});

// Routes for user authentication
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate email
  if (!email.endsWith('@collegename.com')) {
    return res.status(400).send('Email must be a @collegename.com email address');
  }

  const client = await pool2.connect();
  try {
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).send('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  } finally {
    client.release();
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const client = await pool2.connect();
  try {
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' }); // Return error as JSON
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' }); // Return error as JSON
    }

    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' }); // Return error as JSON
  } finally {
    client.release();
  }
});

// Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).send('Access denied');
  }

  try {
    const verified = jwt.verify(token, 'your-secret-key');
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).send('Invalid token');
  }
};

// Example protected route
app.get('/protected', authenticate, (req, res) => {
  res.send('This is a protected route');
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
