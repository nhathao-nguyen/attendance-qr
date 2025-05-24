const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and protect routes
exports.protect = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to restrict to teacher role
exports.restrictToTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      message: 'Access denied. Only teachers can perform this action' 
    });
  }
  next();
};

// Middleware to restrict to student role
exports.restrictToStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Access denied. Only students can perform this action' 
    });
  }
  next();
}; 