const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  type: { type: String, enum: ['od', 'leave'], required: true },
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'mentor_approved', 'approved', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  mentorMessage: { type: String },
  adminMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Form', FormSchema);
