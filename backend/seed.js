const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing users to avoid duplicates
    await User.deleteMany({});

    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator'
      },
      {
        username: 'mentor',
        password: 'mentor123',
        role: 'mentor',
        name: 'Class Mentor'
      }
    ];

    await User.insertMany(users);
    console.log('Database seeded with default users:');
    console.log('Admin: admin / admin123');
    console.log('Mentor: mentor / mentor123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
