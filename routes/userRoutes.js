const express = require('express');
const { createUser, getUserById, updateUserBalance, fetchTelegramID, handleDailyCheckIn } = require('../controllers/userController');

const router = express.Router();

router.post('/register', createUser);
router.get('/:id', getUserById);
router.put('/:id/balance', updateUserBalance);
router.post('/fetchTelegramID', fetchTelegramID);
router.post('/dailyCheckIn', handleDailyCheckIn); // Add this line

module.exports = router;

