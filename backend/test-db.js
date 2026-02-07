const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log(`Connecting to: ${uri.split('@').pop()}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    if (err.message.includes('Authentication failed')) {
      console.error('TIP: Your password in .env is likely incorrect.');
    }
    process.exit(1);
  }
};

testConnection();
