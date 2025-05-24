const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate a unique class code before saving
classSchema.pre('save', async function(next) {
  if (!this.isModified('name')) return next();
  // Generate a random 6-character alphanumeric code
  this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
  next();
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class; 