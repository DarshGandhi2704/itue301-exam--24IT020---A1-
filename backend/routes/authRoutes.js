const express = require('express');
const jwt = require('jsonwebtoken');
const Attendee = require('../models/Attendee');

const router = express.Router();

// POST /api/v1/auth/login
// Public endpoint: Authenticate an attendee, return JWT token, attendee info, and role
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find attendee by lowercase email
    const attendee = await Attendee.findOne({ email: email.toLowerCase().trim() });
    if (!attendee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare hashed password
    const isMatch = await attendee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'eventhub_super_secret_jwt_key_2026';
    const payload = {
      id: attendee._id,
      name: attendee.name,
      email: attendee.email,
      role: attendee.role
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: attendee.role,
      attendee: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        role: attendee.role
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
