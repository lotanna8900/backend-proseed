const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  console.log(`Attempting to connect to MongoDB with URI: ${uri}`);
  const connectWithRetry = () => {
    mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then(conn => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
      })
      .catch(err => {
        console.error(`Error: ${err.message}`);
        console.log('Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
      });
  };
  connectWithRetry();
};

module.exports = connectDB;

