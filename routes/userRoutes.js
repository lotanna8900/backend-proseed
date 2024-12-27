const express = require('express');
const { createUser, getUserById, updateUserBalance, fetchTelegramID, handleDailyCheckIn, getUserByTelegramId } = require('../controllers/userController');

const router = express.Router();

router.post('/register', createUser);
router.get('/id/:id', getUserById); // Updated route to avoid conflict
router.put('/:id/balance', updateUserBalance);
router.post('/fetchTelegramID', fetchTelegramID);
router.post('/dailyCheckIn', handleDailyCheckIn);
router.get('/telegram/:telegramId', getUserByTelegramId); // Reintroduced route

module.exports = router;