import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  reward: Number,
  category: String,
  completions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date, default: Date.now }
  }]
});

// Add index for faster lookups
taskSchema.index({ 'completions.userId': 1 });

export default mongoose.model('Task', taskSchema);
