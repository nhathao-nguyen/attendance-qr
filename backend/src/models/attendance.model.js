const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to prevent duplicate attendance records
attendanceSchema.index({ lesson: 1, student: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 