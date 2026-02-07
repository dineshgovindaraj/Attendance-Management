const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
require('dotenv').config();

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db';
    console.log(`Connecting to: ${uri.split('@').pop()}`);
    await mongoose.connect(uri);
    
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});

    // Seed Users
    const users = [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
      { username: 'mentor', password: 'mentor123', role: 'mentor', name: 'Class Mentor' }
    ];
    await User.insertMany(users);
    console.log('✅ Users seeded');

    // Seed Students
    const students = [
      { name: 'Dinesh Kumar', regNo: '731621104001', dob: '2003-05-15', class: '4 year', section: 'A', leaveBalance: 25 },
      { name: 'Priya Dharshini', regNo: '731621104002', dob: '2003-08-22', class: '4 year', section: 'A', leaveBalance: 25 },
      { name: 'Vijay S', regNo: '731621104003', dob: '2004-01-10', class: '3 year', section: 'B', leaveBalance: 25 },
      { name: 'Deepika R', regNo: '731621104004', dob: '2004-03-05', class: '3 year', section: 'B', leaveBalance: 25 },
      { name: 'Rahul K', regNo: '731621104005', dob: '2005-02-14', class: '2 year', section: 'C', leaveBalance: 25 }
    ];
    await Student.insertMany(students);
    console.log('✅ Students seeded');

    console.log('\nSeed Complete!');
    console.log('Admin: admin / admin123');
    console.log('Mentor: mentor / mentor123');
    process.exit();
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    process.exit(1);
  }
};

seedData();
