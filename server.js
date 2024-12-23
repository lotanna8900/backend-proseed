const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const fetchTelegramID = require('./api/fetchTelegramID');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Define API routes
app.get('/api/fetchTelegramID', fetchTelegramID); // GET endpoint
app.use('/api/users', userRoutes); // POST endpoint

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




