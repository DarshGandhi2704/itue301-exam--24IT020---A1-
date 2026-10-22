const jwt = require('jsonwebtoken');

// authGuard middleware
// Reads Authorization header, expects Bearer token, validates token
// Returns HTTP 401 for missing or invalid token
const authGuard = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authorization token missing.'
      });
    }

    // Expecting format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Format must be Bearer <token>.'
      });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'eventhub_super_secret_jwt_key_2026';

    const decoded = jwt.verify(token, secret);
    // Attach decoded attendee info (id, name, email, role) to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.'
    });
  }
};

// Optional helper for role verification (e.g., organizer)
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { authGuard, roleGuard };
