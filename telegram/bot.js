const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { registerOrUpdateUser } = require('../controllers/userController');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.MONGO_URI || !process.env.TELEGRAM_BOT_TOKEN) {
  console.error("Error: Missing environment variables");
  process.exit(1);
}

const uri = process.env.MONGO_URI;
const dbName = 'proseed';
const client = new MongoClient(uri);
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Express server setup
const app = express();
app.use(express.json());  // Middleware to parse incoming JSON requests

// Rate limiter setup to limit requests to 100 per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,  // Limit each IP to 100 requests per window
});
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next(); // Exclude /health route from rate limiter
  }
  limiter(req, res, next);
});

// Async function to connect to MongoDB
const connectDb = async () => {
  try {
    await client.connect();
    console.log('MongoDB Connected');
    return client.db(dbName);  // Return the db instance
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit if connection fails
  }
};

// Establish MongoDB connection
let db;
try {
  db = await connectDb(); // Await the connection
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
}

// Error handler utility
const handleError = (error, chatId, message = 'An error occurred') => {
  console.error('Error:', error);
  bot.sendMessage(chatId, message);
};

// Bot event handlers
bot.on('message', (msg) => {
  console.log('Message received:', msg);
});

bot.onText(/\/start/, async (msg) => {
  console.log('/start command received:', msg);
  const chatId = msg.chat.id;
  let username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim() || msg.from.first_name;

  // Fallback to a default username if none is provided
  if (!username) {
    username = `User_${chatId}`;
  }

  try {
    const user = await registerOrUpdateUser(chatId, username);
    const welcomeMessage = `Welcome to proSEED, ${user.username}!\nYour ID: ${user.telegramId}`;
    const baseUrl = process.env.BASE_URL || 'https://backend-proseed.vercel.app';
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Start App',
              web_app: { url: baseUrl },
            },
          ],
        ],
      },
    };

    bot.sendMessage(chatId, welcomeMessage, options);
  } catch (error) {
    handleError(error, chatId, 'Error handling /start command');
  }
});

bot.onText(/\/balance/, async (msg) => {
  console.log('/balance command received:', msg);
  const chatId = msg.chat.id;
  try {
    const user = await db.collection('users').findOne({ telegramId: chatId });
    if (user) {
      bot.sendMessage(chatId, `Your current PSDT balance is: ${user.psdtBalance}`);
    } else {
      bot.sendMessage(chatId, 'User not found. Please register first.');
    }
  } catch (error) {
    handleError(error, chatId, 'Error handling /balance command');
  }
});

bot.onText(/\/register/, async (msg) => {
  console.log('/register command received:', msg);
  const chatId = msg.chat.id;
  try {
    const user = await registerOrUpdateUser(chatId, msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim() || msg.from.first_name);
    bot.sendMessage(chatId, 'Registration successful!');
  } catch (error) {
    handleError(error, chatId, 'Error handling /register command');
  }
});

bot.onText(/\/fetchID/, async (msg) => {
  console.log('/fetchID command received:', msg);
  const chatId = msg.chat.id;
  try {
    const user = await db.collection('users').findOne({ telegramId: chatId });
    if (user && !user.telegramId) {
      await db.collection('users').updateOne({ _id: user._id }, { $set: { telegramId: chatId } });
      bot.sendMessage(chatId, 'Telegram ID saved successfully.');
    } else if (user) {
      bot.sendMessage(chatId, 'Telegram ID is already saved.');
    } else {
      bot.sendMessage(chatId, 'User not found.');
    }
  } catch (error) {
    handleError(error, chatId, 'Error handling /fetchID command');
  }
});

// Polling error handler
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.response.body);
});

// Health check endpoint to monitor bot's status
app.get('/health', async (req, res) => {
  try {
    await client.db().command({ ping: 1 }); // MongoDB health check
    res.status(200).send('Bot service is running and MongoDB is connected');
  } catch (error) {
    res.status(500).send('Bot service is running, but MongoDB is not connected');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export app to be used in larger module or testing