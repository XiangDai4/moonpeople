// server/routes/contact.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const {
  submitContactMessage,
  getUserMessages, // Added this import
  getContactMessages,
  getNotificationCount,
  markAsRead,
  replyToMessage,
  deleteMessage
} = require('../controllers/contact');

// Import your existing auth middleware
const { protect, admin } = require('../middleware/auth');

// Rate limiting for contact form submissions
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Maximum 3 submissions per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again in 15 minutes.',
  },
});

// Validation rules for contact form
const contactValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email is too long'),
    
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters')
    .trim()
    .escape(),
    
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Message must be between 20 and 2000 characters')
    .trim()
    .escape()
];

// Public routes
router.post('/submit', contactFormLimiter, contactValidation, submitContactMessage);

// User routes (authenticated users can see their own messages)
router.get('/user-messages', protect, getUserMessages); // Added this route

// Admin-only routes
router.get('/messages', protect, admin, getContactMessages);
router.get('/notifications', protect, admin, getNotificationCount);
router.patch('/messages/:id/read', protect, admin, markAsRead);
router.post('/messages/:id/reply', protect, admin, replyToMessage);
router.delete('/messages/:id', protect, admin, deleteMessage);

module.exports = router;