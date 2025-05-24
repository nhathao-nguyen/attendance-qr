const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const lessonController = require('../controllers/lesson.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Configure file storage for lesson attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lesson-attachments');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// @route   POST /api/lessons
// @desc    Create a new lesson (teacher only)
// @access  Private/Teacher
router.post(
  '/',
  [
    authMiddleware.protect,
    authMiddleware.restrictToTeacher,
    upload.array('attachments', 5),
    [
      check('title', 'Lesson title is required').not().isEmpty(),
      check('content', 'Lesson content is required').not().isEmpty(),
      check('classId', 'Class ID is required').not().isEmpty()
    ]
  ],
  lessonController.createLesson
);

// @route   GET /api/lessons/class/:classId
// @desc    Get all lessons for a class
// @access  Private
router.get(
  '/class/:classId',
  authMiddleware.protect,
  lessonController.getLessonsByClass
);

// @route   GET /api/lessons/:id
// @desc    Get a lesson by ID
// @access  Private
router.get(
  '/:id',
  authMiddleware.protect,
  lessonController.getLessonById
);

// @route   PUT /api/lessons/:id
// @desc    Update a lesson (teacher only)
// @access  Private/Teacher
router.put(
  '/:id',
  [
    authMiddleware.protect,
    authMiddleware.restrictToTeacher,
    upload.array('attachments', 5),
    [
      check('title', 'Lesson title is required').not().isEmpty(),
      check('content', 'Lesson content is required').not().isEmpty()
    ]
  ],
  lessonController.updateLesson
);

// @route   DELETE /api/lessons/:id
// @desc    Delete a lesson (teacher only)
// @access  Private/Teacher
router.delete(
  '/:id',
  [
    authMiddleware.protect,
    authMiddleware.restrictToTeacher
  ],
  lessonController.deleteLesson
);

// @route   POST /api/lessons/:id/qrcode
// @desc    Generate QR code for lesson attendance (teacher only)
// @access  Private/Teacher
router.post(
  '/:id/qrcode',
  [
    authMiddleware.protect,
    authMiddleware.restrictToTeacher
  ],
  lessonController.generateQRCode
);

// @route   POST /api/lessons/scan-qrcode
// @desc    Scan QR code to record attendance (student only)
// @access  Private/Student
router.post(
  '/scan-qrcode',
  [
    authMiddleware.protect,
    authMiddleware.restrictToStudent,
    [
      check('qrData', 'QR code data is required').not().isEmpty()
    ]
  ],
  lessonController.scanQRCode
);

// @route   GET /api/lessons/:id/attendance
// @desc    Get attendance list for a lesson (teacher only)
// @access  Private/Teacher
router.get(
  '/:id/attendance',
  [
    authMiddleware.protect,
    authMiddleware.restrictToTeacher
  ],
  lessonController.getAttendanceList
);

module.exports = router; 