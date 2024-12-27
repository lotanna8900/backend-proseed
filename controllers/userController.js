const User = require('../models/User');

// Register or update a user based on their Telegram ID
const registerOrUpdateUser = async (telegramId, username, walletAddress = null) => {
  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      // Create a new user with the provided information
      user = new User({
        username: username || telegramId,
        walletAddress,
        telegramId,
        psdtBalance: 1000, // Initial balance set to 1000
      });
      await user.save();
    } else {
      // Update the existing user information if needed
      if (username && user.username !== username) user.username = username;
      if (walletAddress && user.walletAddress !== walletAddress) user.walletAddress = walletAddress;
      await user.save();
    }

    return user;
  } catch (error) {
    throw new Error('Error registering or updating user: ' + error.message);
  }
};

// Get user data by MongoDB ObjectId
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user data by Telegram ID
const getUserByTelegramId = async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user PSDT balance
const updateUserBalance = async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { psdtBalance: balance }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create or register a new user
const createUser = async (req, res) => {
  const { username, walletAddress, telegramId } = req.body;
  try {
    const user = await registerOrUpdateUser(telegramId, username, walletAddress);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to retrieve user's Telegram ID and update in user profile
const fetchTelegramID = async (req, res) => {
  const { telegramID } = req.body;
  try {
    // Corrected field name from telegramID to telegramId
    const user = await User.findOneAndUpdate({ telegramId: telegramID }, { $set: { telegramId: telegramID } }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleDailyCheckIn = async (req, res) => {
  const { telegramId } = req.body;
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has already checked in today
    const lastCheckIn = user.lastCheckIn || new Date(0);
    const now = new Date();
    if (now.toDateString() === lastCheckIn.toDateString()) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Update the user's balance and last check-in date
    user.psdtBalance += 100; // Add 100 PSDT to the balance
    user.lastCheckIn = now;
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerOrUpdateUser,
  createUser,
  getUserById,
  getUserByTelegramId,
  updateUserBalance,
  fetchTelegramID,
  handleDailyCheckIn
};

