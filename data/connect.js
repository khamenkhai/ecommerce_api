const mongoose = require('mongoose');

const connectDB = (url) => {
  console.log(`Attempting to connect to MongoDB...${url}`);
  return mongoose
    .connect(url)
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    });
};

module.exports = connectDB;