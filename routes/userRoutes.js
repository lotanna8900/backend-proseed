const express = require('express');
const { 
  createUser, 
  getUserById, 
  updateUserBalance, 
  fetchTelegramID, 
  handleDailyCheckIn, 
  getUserByTelegramId 
} = require('../controllers/userController');

const router = express.Router();

// Updated routes with proper prefixes removed (since they're handled in server.js)
router.post('/register', createUser);
router.get('/:id', getUserById);
router.get('/telegram/:telegramId', getUserByTelegramId);
router.put('/:id/balance', updateUserBalance);
router.post('/fetchTelegramID', fetchTelegramID);
router.post('/dailyCheckIn', handleDailyCheckIn);

module.exports = router;