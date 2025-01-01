import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  telegramId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: false, // Changed from true to false
    unique: true,
    sparse: true,  // Added sparse index for null values
    trim: true,
    validate: {
      validator: function(v) {
        return v === null || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum wallet address'
    }
  },
  psdtBalance: {
    type: Number,
    default: 1000,
    min: 0
  },
  referralLink: {
    type: String,
    default: '',
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastCheckIn: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedTasks: [{
    type: Number,
    default: []
  }]
});

// Add pre-save middleware
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
