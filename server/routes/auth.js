// server/routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  verifyEmail, 
  verifyEmailCode,
  resendVerification,
  googleCallback 
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { logout, getMe } = require('../controllers/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Email verification routes
router.get('/verify-email/:token', verifyEmail); // Legacy token-based verification
router.post('/verify-email', verifyEmailCode); // New 6-digit code verification
router.post('/resend-verification', resendVerification);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.post('/logout', logout);
router.get('/me', getMe);

// Google callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    // Successful authentication, redirect to success page
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success`);
  }
);

module.exports = router;