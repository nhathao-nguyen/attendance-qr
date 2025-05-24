const { validationResult } = require('express-validator');
const User = require('../models/user.model');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, phoneNumber, studentCode } = req.body;
    
    // Check if email already exists with a different user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (studentCode) updateData.studentCode = studentCode;
    
    // Update profile picture path with the proper URL format
    if (req.file) {
      // Format the path for frontend access
      const filePath = `/uploads/profile-pictures/${req.file.filename}`;
      updateData.profilePicture = filePath;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 