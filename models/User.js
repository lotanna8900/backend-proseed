const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  psdtBalance: {
    type: Number,
    default: 0,
  },
  referralLink: {
    type: String,
    default: '',
  },
  telegramId: {
    type: String,
    unique: true,
  },
  lastCheckIn: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('User', userSchema);

