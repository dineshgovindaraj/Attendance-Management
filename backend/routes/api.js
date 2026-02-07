const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Form = require('../models/Form');
const User = require('../models/User');

// --- Auth Routes ---

// Login
router.post('/auth/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.findOne({ username, password, role });
    if (user) {
      res.json({ success: true, user: { username: user.username, role: user.role, name: user.name } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create User (Initial Setup/Admin only)
router.post('/auth/register', async (req, res) => {
  const { username, password, role, name } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ username, password, role, name });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Students Types ---

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a student
router.post('/students', async (req, res) => {
  const { name, regNo, dob, class: className, section } = req.body;
  console.log(`[POST] Attempting to add student: ${name} (${regNo})`); // Debug log
  try {
    const existingStudent = await Student.findOne({ regNo });
    if (existingStudent) {
      console.log(`[POST] Add failed: Student with regNo ${regNo} already exists`);
      return res.status(400).json({ message: 'Student already exists' });
    }
    const newStudent = new Student({
      name,
      regNo,
      dob,
      class: className,
      section
    });
    const savedStudent = await newStudent.save();
    console.log(`[POST] Student saved successfully: ${savedStudent._id}`);
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error(`[POST] Error adding student: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
});

// Deduct leave balance
router.put('/students/:regNo/deduct', async (req, res) => {
  const { days } = req.body;
  const deductionAmount = days ? parseInt(days) : 1;
  
  try {
    const student = await Student.findOne({ regNo: req.params.regNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (student.leaveBalance >= deductionAmount) {
      student.leaveBalance -= deductionAmount;
      await student.save();
      res.json(student);
    } else {
      res.status(400).json({ message: 'Insufficient leave balance' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a student
router.delete('/students/:id', async (req, res) => {
  console.log(`[DELETE] Request for ID: ${req.params.id}`); // Debug log
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      console.log(`[DELETE] Student not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Student not found' });
    }
    await student.deleteOne();
    console.log(`[DELETE] Student removed successfully`);
    res.json({ message: 'Student removed' });
  } catch (err) {
    console.error(`[DELETE] Error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// --- Forms ---

// Get all forms
router.get('/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ submittedAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a form
router.post('/forms', async (req, res) => {
  const form = new Form(req.body);
  try {
    const newForm = await form.save();
    res.status(201).json(newForm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update form status
router.put('/forms/:id/status', async (req, res) => {
  const { status, message, isMentor } = req.body;
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    form.status = status;
    if (isMentor) {
      form.mentorMessage = message;
    } else {
      form.adminMessage = message;
    }

    const updatedForm = await form.save();
    res.json(updatedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
