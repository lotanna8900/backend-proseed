const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = 'proseed';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  authSource: 'admin',
  ssl: true,
});

client.connect();

module.exports = async (req, res) => {
  try {
    const telegramID = req.query.telegramId;
    if (!telegramID) {
      throw new Error('Missing telegramId query parameter');
    }
    const db = client.db(dbName);
    const users = db.collection('users');
    const user = await users.findOne({ telegramId: Number(telegramID) });

    if (user) {
      res.json({ telegramID: user.telegramId });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
