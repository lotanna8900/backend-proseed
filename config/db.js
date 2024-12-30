import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  console.log(`Attempting to connect to MongoDB with URI: ${uri}`);
  
  const connectWithRetry = () => {
    mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    })
    .then(conn => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    })
    .catch(err => {
      console.error(`Error: ${err.message}`);
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
  };

  // Handle disconnection
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectWithRetry();
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });

  connectWithRetry();
};

export default connectDB;
