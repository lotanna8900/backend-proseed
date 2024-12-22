const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  console.log(`Attempting to connect to MongoDB with URI: ${uri}`);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // You can set other options as needed
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

