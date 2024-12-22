const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const axios = require('axios');
const { registerOrUpdateUser } = require('../controllers/userController');

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = 'proseed';

const client = new MongoClient(uri);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();
app.use(express.json());
app.use(limiter);

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

client.connect()
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

const db = client.db(dbName);

const handleError = (error, chatId, message = 'An error occurred') => {
  console.error(error);
  bot.sendMessage(chatId, message);
};

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
  setTimeout(() => {
    bot.startPolling();
  }, 5000);
});

const fetchData = async (url, options, retries = 3) => {
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    if (retries > 0) {
      return fetchData(url, options, retries - 1);
    } else {
      throw error;
    }
  }
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    let username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim() || msg.from.first_name;
    
    // Fallback to a default username if none is provided
    if (!username) {
      username = `User_${chatId}`;
    }
  
    try {
      const user = await registerOrUpdateUser(chatId, username);
  
      const welcomeMessage = `Welcome to proSEED, ${user.username}!\nYour ID: ${user.telegramId}`;
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Start App',
                web_app: { url: 'https://proseedtesting.netlify.app/app' },
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
  const chatId = msg.chat.id;
  try {
    const user = await registerOrUpdateUser(chatId, msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim() || msg.from.first_name);
    bot.sendMessage(chatId, 'Registration successful!');
  } catch (error) {
    handleError(error, chatId, 'Error handling /register command');
  }
});

bot.onText(/\/fetchID/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const user = await db.collection('users').findOne({ telegramId: chatId });
    if (user) {
      await db.collection('users').updateOne({ telegramId: chatId }, { $set: { telegramID: chatId } });
      bot.sendMessage(chatId, 'Telegram ID saved successfully.');
    } else {
      bot.sendMessage(chatId, 'User not found.');
    }
  } catch (error) {
    handleError(error, chatId, 'Error handling /fetchID command');
  }
});

app.get('/health', (req, res) => {
  res.send('Bot service is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

