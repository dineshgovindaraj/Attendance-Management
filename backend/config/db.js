const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db';
    console.log(`[DB] Attempting to connect to: ${uri.includes('@') ? uri.split('@').pop() : uri}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    console.log(`[DB] ✅ MongoDB Connected: ${mongoose.connection.host}`);
    global.dbConnected = true;
  } catch (err) {
    console.error(`[DB] ❌ Connection Error: ${err.message}`);
    global.dbConnected = false;
    
    if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
      console.error(`[DB] CRITICAL: Invalid password in .env for MongoDB Atlas.`);
      console.error(`[DB] Action Required: Replace REPLACE_WITH_YOUR_PASSWORD with your actual password in backend/.env`);
    }

    if (err.message.includes('REPLACE_WITH_YOUR_PASSWORD')) {
      console.error(`[DB] ⚠️  You need to set your actual MongoDB password in the .env file`);
      console.error(`[DB] The placeholder 'REPLACE_WITH_YOUR_PASSWORD' is not a valid password`);
    }

    console.log(`[DB] ⚠️  Server will run in LOCAL STORAGE MODE (data won't persist on server restart)`);
    console.log(`[DB] To fix: Update .env with your MongoDB Atlas password OR wait for local MongoDB to install`);
  }
};

module.exports = connectDB;
