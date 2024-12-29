const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Connect to MongoDB only if not already connected
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => res.send('Server is healthy'));

// Import bot only in development
if (process.env.NODE_ENV === 'development') {
  require('./telegram/bot.js');
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve all files in build directory
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  // Handle unknown routes: Serve React's index.html for non-API paths
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).send('API route not found');
    }
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// Start server only in development
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for serverless
module.exports = app;