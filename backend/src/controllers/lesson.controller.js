const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Lesson = require('../models/lesson.model');
const Class = require('../models/class.model');
const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');

// Create a new lesson (teacher only)
exports.createLesson = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, classId } = req.body;

    // Check if class exists and user is the teacher
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classItem.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to add lessons to this class' });
    }

    // Create new lesson
    const newLesson = new Lesson({
      title,
      content,
      class: classId,
      teacher: req.user.userId,
      attachments: req.files ? req.files.map(file => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype
      })) : []
    });

    await newLesson.save();

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson: newLesson
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all lessons for a class
exports.getLessonsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if class exists and user is a teacher or student
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const isTeacher = classItem.teacher.toString() === req.user.userId;
    const isStudent = classItem.students.some(
      student => student.toString() === req.user.userId
    );

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }

    // Get lessons
    const lessons = await Lesson.find({ class: classId })
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ lessons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single lesson by ID
exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id)
      .populate('teacher', 'name email')
      .populate('class', 'name code');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is allowed to access this lesson
    const classItem = await Class.findById(lesson.class._id);
    
    const isTeacher = classItem.teacher.toString() === req.user.userId;
    const isStudent = classItem.students.some(
      student => student.toString() === req.user.userId
    );

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Not authorized to access this lesson' });
    }

    res.status(200).json({ lesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a lesson (teacher only)
exports.updateLesson = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content } = req.body;

    // Find the lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the teacher who created this lesson
    if (lesson.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    // Update lesson fields
    if (title) lesson.title = title;
    if (content) lesson.content = content;

    // Add new attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype
      }));
      
      lesson.attachments = [...lesson.attachments, ...newAttachments];
    }

    await lesson.save();

    res.status(200).json({
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a lesson (teacher only)
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the teacher who created this lesson
    if (lesson.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    // Delete related attendance records
    await Attendance.deleteMany({ lesson: id });

    // Delete the lesson
    await Lesson.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate QR code for attendance (teacher only)
exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the teacher who created this lesson
    if (lesson.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to manage this lesson' });
    }

    // Generate random data for QR code
    const randomBytes = crypto.randomBytes(16).toString('hex');
    
    // Set expiration time to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Update the lesson with QR code data
    lesson.qrCode = {
      data: randomBytes,
      expiresAt,
      isActive: true
    };

    await lesson.save();

    res.status(200).json({
      message: 'QR code generated successfully',
      qrCode: {
        data: lesson.qrCode.data,
        expiresAt: lesson.qrCode.expiresAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Scan QR code (student only)
exports.scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Get client IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Find lesson with matching QR code
    const lesson = await Lesson.findOne({
      'qrCode.data': qrData,
      'qrCode.isActive': true,
      'qrCode.expiresAt': { $gt: new Date() }
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Find the class for this lesson
    const classItem = await Class.findById(lesson.class);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is a student in this class
    const isStudent = classItem.students.some(
      student => student.toString() === req.user.userId
    );

    if (!isStudent) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }

    // Record attendance
    try {
      const attendance = new Attendance({
        lesson: lesson._id,
        student: req.user.userId,
        class: classItem._id,
        ipAddress
      });

      await attendance.save();

      res.status(200).json({
        message: 'Attendance recorded successfully'
      });
    } catch (error) {
      // Handle duplicate attendance (already scanned)
      if (error.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'You have already recorded attendance for this lesson' });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance list for a lesson (teacher only)
exports.getAttendanceList = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the teacher who created this lesson
    if (lesson.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this lesson' });
    }

    // Get attendance records
    const attendanceList = await Attendance.find({ lesson: id })
      .populate({
        path: 'student',
        select: 'name email studentCode profilePicture'
      })
      .sort({ scannedAt: -1 });

    res.status(200).json({
      attendanceCount: attendanceList.length,
      attendanceList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 