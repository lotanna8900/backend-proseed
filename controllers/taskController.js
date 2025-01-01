import Task from '../models/Task.js';
import User from '../models/User.js';

export const completeTask = async (req, res) => {
  const { userId, taskId } = req.body;
  try {
    const task = await Task.findById(taskId);
    const user = await User.findOne({ telegramId: userId });
    
    if (!task.completions.some(c => c.userId.equals(user._id))) {
      user.psdtBalance += task.reward;
      task.completions.push({ userId: user._id });
      
      await Promise.all([user.save(), task.save()]);
      
      res.json({ 
        success: true, 
        newBalance: user.psdtBalance,
        message: `Earned ${task.reward} PSDT!` 
      });
    } else {
      res.status(400).json({ message: 'Task already completed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};