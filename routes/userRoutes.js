const express = require('express');
const { createUser, getUserById, updateUserBalance, fetchTelegramID, handleDailyCheckIn, getUserByTelegramId } = require('../controllers/userController');

const router = express.Router();

router.post('/register', createUser);
router.get('/id/:id', getUserById); // Updated route to avoid conflict
router.put('/:id/balance', updateUserBalance);
router.post('/fetchTelegramID', fetchTelegramID);
router.post('/dailyCheckIn', handleDailyCheckIn);
router.get('/telegram/:telegramId', getUserByTelegramId); // Updated route to avoid conflict

// Add the new route here
router.get('/byTelegramId/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add the daily check-in route here
router.post('/users/dailyCheckIn', async (req, res) => {
  const { telegramId } = req.body;
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Daily check-in logic
    if (!user.lastCheckIn || new Date() - user.lastCheckIn > 24 * 60 * 60 * 1000) {
      user.psdtBalance += 10; // Add points
      user.lastCheckIn = new Date(); // Update last check-in time
      await user.save();
      return res.json({ psdtBalance: user.psdtBalance });
    } else {
      return res.status(400).json({ message: 'Already checked in today' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;