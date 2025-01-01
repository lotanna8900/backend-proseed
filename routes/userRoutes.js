import express from 'express';
import { 
  createUser, 
  getUserById, 
  updateUserBalance, 
  fetchTelegramID, 
  handleDailyCheckIn, 
  getUserByTelegramId,
  generateReferral,
  completeTask
} from '../controllers/userController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Apply rate limiting to all routes
router.use(limiter);

// User routes
router.post('/register', createUser);
router.get('/id/:id', getUserById);
router.put('/:id/balance', updateUserBalance);
router.post('/fetchTelegramID', fetchTelegramID);
router.post('/completeTask', completeTask);
router.post('/dailyCheckIn', handleDailyCheckIn);
router.post('/generateReferral', generateReferral);
router.get('/telegram/:telegramId', getUserByTelegramId);

export default router;