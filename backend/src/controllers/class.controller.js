const { validationResult } = require('express-validator');
const Class = require('../models/class.model');
const User = require('../models/user.model');

// Create a new class (teacher only)
exports.createClass = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Create new class
    const newClass = new Class({
      name,
      description,
      teacher: req.user.userId,
      code: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    await newClass.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all classes for a teacher
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user.userId })
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all classes a student is enrolled in
exports.getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user.userId })
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single class by ID
exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is teacher or student of the class
    const isTeacher = classItem.teacher._id.toString() === req.user.userId;
    const isStudent = classItem.students.some(
      student => student._id.toString() === req.user.userId
    );

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }

    res.status(200).json({ class: classItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join a class with code (student only)
exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;

    // Find class by code
    const classItem = await Class.findOne({ code });
    if (!classItem) {
      return res.status(404).json({ message: 'Invalid class code' });
    }

    // Check if already enrolled
    if (classItem.students.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    // Add student to class
    classItem.students.push(req.user.userId);
    await classItem.save();

    res.status(200).json({
      message: 'Successfully joined the class',
      class: classItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 