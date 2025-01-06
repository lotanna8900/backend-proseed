import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import TelegramBot from 'node-telegram-bot-api';
import { registerOrUpdateUser } from './controllers/userController.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

if (!process.env.MONGO_URI || !process.env.TELEGRAM_BOT_TOKEN || !process.env.BASE_URL) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const app = express();

// Create bot instance before middleware setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });

// Special handling for webhook route
app.use('/webhook', bodyParser.json());

// Regular JSON parsing for other routes
app.use(express.json());

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 900000,
  max: process.env.RATE_LIMIT_MAX || 100,
});
app.use(limiter);

// Initialize bot and database before starting server
await connectDB();

// Add the index drop code here
try {
  const collections = await mongoose.connection.db.listCollections().toArray();
  const usersCollection = collections.find(col => col.name === 'users');
  
  if (usersCollection) {
    const indexes = await mongoose.connection.db.collection('users').indexes();
    const hasWalletIndex = indexes.some(index => index.name === 'walletAddress_1');
    
    if (hasWalletIndex) {
      console.log('Dropping walletAddress index...');
      await mongoose.connection.db.collection('users').dropIndex('walletAddress_1');
      console.log('Successfully dropped walletAddress index');
    }
  }
} catch (error) {
  console.error('Error handling walletAddress index:', error);
  // Continue execution even if index drop fails
}

const webhookUrl = 'https://backend-proseed.vercel.app/webhook';

// Set webhook with specific allowed updates
await bot.setWebHook(webhookUrl, {
  allowed_updates: ['message', 'callback_query']
})
.then(() => console.log(`Webhook set successfully at ${webhookUrl}`))
.catch((error) => {
  console.error('Error setting webhook:', error);
  process.exit(1);
});

// Enhanced webhook handler
app.post('/webhook', async (req, res) => {
  try {
    console.log('Received webhook update:', JSON.stringify(req.body, null, 2));
    
    if (!req.body) {
      return res.sendStatus(400);
    }

    // Process update and send immediate response
    res.sendStatus(200);
    await bot.processUpdate(req.body);
  } catch (error) {
    console.error('Webhook error:', error);
    if (!res.headersSent) {
      res.sendStatus(500);
    }
  }
});

// Add debugging route for webhook info
app.get('/webhook', async (req, res) => {
  try {
    const webhookInfo = await bot.getWebHookInfo();
    res.status(200).json(webhookInfo);
  } catch (error) {
    console.error('Error getting webhook info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced error handling for bot commands
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username ||
    `${msg.from.first_name} ${msg.from.last_name}`.trim() ||
    `User_${chatId}`;

  try {
    console.log(`Processing /start command for user ${username} (${chatId})`);
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, attempting to reconnect...');
      await connectDB();
    }

    const user = await registerOrUpdateUser(chatId.toString(), username);
    console.log('User registered:', user);

    await bot.sendMessage(chatId, `Welcome to proSEED, ${username}!\nYour ID: ${chatId}`, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🚀 Launch App',
            url: 'https://t.me/gothcoin_bot/ptesting'
          }
        ]]
      }
    });

  } catch (error) {
    console.error(`Error handling /start command for ${msg.from.username}:`, error);
    await bot.sendMessage(msg.chat.id, 'Error processing your request. Please try again in a few moments.');
  }
});

// Error handling for the bot
bot.on('polling_error', (error) => {
  console.error('Bot polling error:', error);
});

bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

app.use('/api/users', userRoutes);
app.get('/api/health', (req, res) => res.send('Server is healthy'));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;