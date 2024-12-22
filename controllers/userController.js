const User = require('../models/User');

// Get user data by ID
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
      // Check if a user with the same username already exists
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      // Check if a user with the same walletAddress already exists
      const existingUserByWalletAddress = await User.findOne({ walletAddress });
      if (existingUserByWalletAddress) {
        return res.status(400).json({ message: 'Wallet address already exists' });
      }
  
      const newUser = new User({ username, walletAddress, telegramId, psdtBalance: 0 });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  

// Function to retrieve user's Telegram ID and update in user profile
const fetchTelegramID = async (req, res) => {
    const { telegramID } = req.body;
    try {
      // Find the user by telegramId and update it
      const user = await User.findOneAndUpdate({ telegramId: telegramID }, { $set: { telegramId: telegramID } }, { new: true });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };  
  

module.exports = {
  getUserById,
  updateUserBalance,
  createUser,
  fetchTelegramID
};
