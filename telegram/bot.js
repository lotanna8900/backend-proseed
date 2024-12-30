import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { registerOrUpdateUser } from '../controllers/userController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("Error: Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Express setup with rate limiting
const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use((req, res, next) => {
  if (req.path === '/health') return next();
  limiter(req, res, next);
});

// Error handler
const handleError = (error, chatId, message = 'An error occurred') => {
  console.error('Error:', error);
  bot.sendMessage(chatId, message);
};

// Bot commands
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 
    `${msg.from.first_name} ${msg.from.last_name}`.trim() || 
    `User_${chatId}`;

  try {
    const user = await registerOrUpdateUser(chatId, username);
    const welcomeMessage = `Welcome to proSEED, ${user.username}!\nYour ID: ${user.telegramId}`;
    const baseUrl = process.env.BASE_URL || 'https://backend-proseed.vercel.app';
    
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Start App', web_app: { url: baseUrl } }
        ]]
      }
    });
  } catch (error) {
    handleError(error, chatId, 'Error handling /start command');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Bot service is running');
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});

export { bot, app };