const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  qrCode: {
    data: String,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson; 