import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import crypto from 'crypto'; // Add this line
import helmet from 'helmet';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MONGO_URI || !process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(express.json());

// Initialize database connection
await connectDB();

// API Routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => res.send('Server is healthy'));

// Import bot only in development
if (process.env.NODE_ENV === 'development') {
  const { bot } = await import('./telegram/bot.js');
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  
  // Handle React routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).send('API route not found');
    }
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// Authentication endpoint
app.post('/authenticate', (req, res) => {
  const initData = req.body.initData;
  const token = process.env.TELEGRAM_BOT_TOKEN; // Use environment variable for token

  const checkString = Object.entries(initData)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(token).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (hash === initData.hash) {
    res.json({ success: true, user: initData.user });
  } else {
    res.status(401).json({ success: false, error: 'Invalid initData' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server with port handling
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.close();
        app.listen(PORT + 1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV === 'development') {
  startServer();
}

export default app;