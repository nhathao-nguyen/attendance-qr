const express = require('express');
const { check } = require('express-validator');
const classController = require('../controllers/class.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// @route   POST /api/classes
// @desc    Create a new class (teacher only)
// @access  Private/Teacher
router.post(
  '/',
  [
    authMiddleware.protect,
    authMiddleware.restrictToTeacher,
    [
      check('name', 'Class name is required').not().isEmpty(),
      check('description', 'Description is required').optional()
    ]
  ],
  classController.createClass
);

// @route   GET /api/classes/teacher
// @desc    Get all classes for logged in teacher
// @access  Private/Teacher
router.get(
  '/teacher',
  [authMiddleware.protect, authMiddleware.restrictToTeacher],
  classController.getTeacherClasses
);

// @route   GET /api/classes/student
// @desc    Get all classes for logged in student
// @access  Private/Student
router.get(
  '/student',
  [authMiddleware.protect, authMiddleware.restrictToStudent],
  classController.getStudentClasses
);

// @route   GET /api/classes/:id
// @desc    Get a class by ID
// @access  Private
router.get(
  '/:id',
  authMiddleware.protect,
  classController.getClassById
);

// @route   POST /api/classes/join
// @desc    Join a class with code (student only)
// @access  Private/Student
router.post(
  '/join',
  [
    authMiddleware.protect,
    authMiddleware.restrictToStudent,
    [
      check('code', 'Class code is required').not().isEmpty()
    ]
  ],
  classController.joinClass
);

module.exports = router; 