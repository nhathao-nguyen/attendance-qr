const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware.protect, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    authMiddleware.protect,
    upload.single('profilePicture'),
    [
      check('name', 'Name is required if provided').optional().not().isEmpty(),
      check('email', 'Please include a valid email if provided').optional().isEmail(),
      check('phoneNumber', 'Phone number format is invalid').optional().isMobilePhone()
    ]
  ],
  userController.updateProfile
);

module.exports = router; 