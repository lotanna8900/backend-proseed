// In models/User.js - Updated schema
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    default: undefined, // Changed from null to undefined
    sparse: true,      // Keep the sparse index
    index: { unique: true, sparse: true }
  },
  psdtBalance: {
    type: Number,
    default: 1000
  },
  completedTasks: {
    type: [Number],
    default: []
  },
  referrals: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add middleware to handle wallet address
userSchema.pre('save', function(next) {
  // If walletAddress is null, set it to undefined
  if (this.walletAddress === null) {
    this.walletAddress = undefined;
  }
  next();
});

export default mongoose.model('User', userSchema);