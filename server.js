const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Import the bot.js to set up webhook and bot functionality
require('./telegram/bot.js');

// Define API routes
app.use('/api', userRoutes); // Use /api prefix for all user routes

// Health check endpoint
app.get('/health', (req, res) => res.send('Server is healthy'));

// Serve static files from the React frontend app
const buildPath = path.join(__dirname, 'frontend', 'build');
app.use(express.static(buildPath));

// Serve the frontend's index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
