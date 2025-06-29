// server/routes/bookings.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAvailableVolunteers,
  createBooking,
  getUserBookings,
  getVolunteerBookings,
  cancelBooking,
  completeBooking,
  getAllBookings
} = require('../controllers/bookings');

// Public routes (none for bookings)

// Protected routes (authenticated users)
router.use(protect);

// Get available volunteers for a service
router.get('/available-volunteers', getAvailableVolunteers);

// Create new booking
router.post('/', createBooking);

// Get current user's bookings
router.get('/my-bookings', getUserBookings);

// Get volunteer's bookings (volunteers only)
router.get('/volunteer-bookings', authorize('volunteer', 'admin'), getVolunteerBookings);

// Cancel booking
router.patch('/:id/cancel', cancelBooking);

// Complete booking (volunteers only)
router.patch('/:id/complete', authorize('volunteer', 'admin'), completeBooking);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllBookings);

module.exports = router;