import User from '../models/User.js';
import crypto from 'crypto';

// Helper Functions
const generateUniqueReferralCode = () => crypto.randomBytes(6).toString('hex');

// Main Controller Functions
export const registerOrUpdateUser = async (telegramId, username) => {
  if (!telegramId) {
    throw new Error('Telegram ID is required');
  }

  try {
    // First try to find existing user
    let user = await User.findOne({ telegramId });
    
    if (user) {
      // Update existing user if username changed
      if (username && username !== user.username) {
        user.username = username;
        user.updatedAt = new Date();
        await user.save();
        console.log('Existing user updated:', {
          telegramId: user.telegramId,
          username: user.username
        });
      }
      return user;
    }

    // Create new user without setting walletAddress
    user = new User({
      telegramId,
      username: username || telegramId,
      psdtBalance: 1000,
      completedTasks: [],
      referrals: []
      // Note: walletAddress is not set here, so it will be undefined
    });
    
    await user.save();
    console.log('New user created:', {
      telegramId: user.telegramId,
      username: user.username
    });
    return user;

  } catch (error) {
    console.error('Registration error details:', {
      errorCode: error.code,
      errorMessage: error.message,
      keyPattern: error.keyPattern,
      stack: error.stack
    });

    if (error.code === 11000) {
      // If duplicate key error occurs, try to find the user again
      const existingUser = await User.findOne({ telegramId });
      if (existingUser) {
        console.log('Retrieved existing user after duplicate key error:', {
          telegramId: existingUser.telegramId,
          username: existingUser.username
        });
        return existingUser;
      }
    }
    
    throw error;
  }
};

// Function to update referral count
const registerReferral = async (req, res) => {
  const { referrerId, newUserId } = req.body;
  try {
    const referrer = await User.findById(referrerId);
    const newUser = await User.findById(newUserId);

    if (referrer && newUser) {
      referrer.referrals.push(newUser._id);
      referrer.referralCount += 1;

      await referrer.save();
      res.json({ success: true, referralCount: referrer.referralCount });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to handle reward claims
const claimReferralReward = async (req, res) => {
  const { userId, reward } = req.body;
  try {
    const user = await User.findOne({ telegramId: userId });
    if (user && reward > 0) {
      user.psdtBalance += reward;
      await user.save();

      res.json({ success: true, newBalance: user.psdtBalance });
    } else {
      res.status(400).json({ message: 'Invalid reward or user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to generate referral link
const generateReferralLink = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ telegramId: userId });
    if (user) {
      const referralCode = generateUniqueReferralCode();
      const referralLink = `https://t.me/gothcoin_bot?start=ref_${referralCode}`;
      user.referralLink = referralLink;
      await user.save();
      res.json({ success: true, referralLink });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserByTelegramId = async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
  const { username, walletAddress, telegramId, referrerId } = req.body;
  try {
    const user = await registerOrUpdateUser(telegramId, username, walletAddress, referrerId);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to retrieve user's Telegram ID and update in user profile
const fetchTelegramID = async (req, res) => {
  const { telegramId } = req.body; // Use lowercase "telegramId" here
  try {
    const user = await User.findOneAndUpdate(
      { telegramId },
      { $set: { telegramId } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleDailyCheckIn = async (req, res) => {
  try {
    const { telegramId } = req.body;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (lastCheckIn && lastCheckIn >= today) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    user.psdtBalance += 100;
    user.lastCheckIn = now;
    await user.save();

    return res.status(200).json({
      success: true,
      psdtBalance: user.psdtBalance,
      message: 'Check-in successful! +100 PSDT'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const generateReferral = async (req, res) => {
  try {
    const { telegramId } = req.body;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const referralCode = generateUniqueReferralCode();
    user.referralLink = `https://t.me/gothcoin_bot?start=ref_${referralCode}`;
    await user.save();

    return res.status(200).json({
      success: true,
      referralLink: user.referralLink
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const { telegramId, taskIndex, reward } = req.body;
    
    if (!telegramId || taskIndex === undefined || !reward) {
      return res.status(400).json({ 
        message: 'Missing required fields: telegramId, taskIndex, or reward' 
      });
    }

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.completedTasks.includes(taskIndex)) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    user.psdtBalance += reward;
    user.completedTasks.push(taskIndex);
    await user.save();

    return res.status(200).json({
      success: true,
      newBalance: user.psdtBalance,
      completedTasks: user.completedTasks
    });
  } catch (error) {
    console.error('Complete task error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Single export statement for all functions
export { 
  createUser, 
  updateUserBalance, 
  fetchTelegramID,
  registerReferral,
  claimReferralReward,
  handleDailyCheckIn,
  completeTask,
  generateReferral,
  getUserById,
  getUserByTelegramId
};