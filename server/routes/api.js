// server/routes/api.js 
const express = require('express');
const router = express.Router();
const volunteersRouter = require('./volunteers');


// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is healthy',
    timestamp: new Date()
  });
});

// Include auth routes
router.use('/auth', require('./auth'));

// Include category routes
router.use('/categories', require('./categories'));

// Include service routes
router.use('/services', require('./services'));

// Include resource routes
router.use('/resources', require('./resources'));

// Include volunteer routes
router.use('/volunteers', volunteersRouter);

router.use('/contact', require('./contact'));


router.use('/forum', require('./forum'));

router.use('/bookings', require('./bookings'));

module.exports = router;