const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve frontend files

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lost_and_found',
  password: 'cherry.21',
  port: 5432,
});

// Routes
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

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Route to delete a post
app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;  // Extract post ID from the URL
  console.log(`Received request to delete post with id: ${postId}`);
  
  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    if (result.rowCount === 0) {
      console.log(`Post with id ${postId} not found.`);
      return res.status(404).send('Post not found');
    }
    
    console.log(`Post with id ${postId} deleted successfully.`);
    res.status(200).send('Post deleted');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Internal server error');
  }
});
