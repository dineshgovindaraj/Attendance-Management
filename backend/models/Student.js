const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  leaveBalance: { type: Number, default: 25 }
});

module.exports = mongoose.model('Student', StudentSchema);
