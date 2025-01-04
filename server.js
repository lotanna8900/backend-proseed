import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import crypto from 'crypto';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import TelegramBot from 'node-telegram-bot-api';
import { registerOrUpdateUser } from './controllers/userController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MONGO_URI || !process.env.TELEGRAM_BOT_TOKEN || !process.env.BASE_URL) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const app = express();
app.use(express.json());

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.set('trust proxy', 1);

// Rate limiter
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 900000,
  max: process.env.RATE_LIMIT_MAX || 100,
});
app.use(limiter);

// Initialize database
await connectDB();

// Telegram bot setup with webhook
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });
const webhookUrl = `${process.env.BASE_URL}/webhook`; // Vercel deployed URL

// Set webhook
bot.setWebHook(webhookUrl)
  .then(() => console.log(`Webhook set successfully at ${webhookUrl}`))
  .catch((error) => {
    console.error('Error setting webhook:', error);
    process.exit(1);
  });

// Handle Telegram webhook updates
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body); // Process the Telegram update
  res.status(200).send('OK');  // Respond with OK
});

// Bot commands
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username ||
    `${msg.from.first_name} ${msg.from.last_name}`.trim() ||
    `User_${chatId}`;

  try {
    const user = await registerOrUpdateUser(chatId, username);
    const welcomeMessage = `Welcome to proSEED, ${user.username}!\nYour ID: ${user.telegramId}`;
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start App', web_app: { url: process.env.BASE_URL } }],
        ],
      },
    });
  } catch (error) {
    console.error('Error handling /start command:', error);
    bot.sendMessage(chatId, 'Error handling your request. Please try again.');
  }
});

// API Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.send('Server is healthy'));

// Serve React files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'frontend', 'build');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).send('API route not found');
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;