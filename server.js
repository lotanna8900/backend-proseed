const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const fetchTelegramID = require('./api/fetchTelegramID'); // Correctly imported
const bot = require('./telegram/bot');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://proseedtesting.netlify.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);
app.get('/api/fetchTelegramID', fetchTelegramID); // Ensure it's app.get, not app.use

const buildPath = path.join(__dirname, 'build');
console.log(`Static files served from: ${buildPath}`);

if (fs.existsSync(buildPath)) {
  console.log('Build directory exists.');
} else {
  console.error('Build directory does NOT exist.');
}

const indexPath = path.join(buildPath, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('index.html exists.');
} else {
  console.error('index.html does NOT exist.');
}

app.use(express.static(buildPath));

app.get('*', (req, res) => {
  console.log(`Requested URL: ${req.url}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
