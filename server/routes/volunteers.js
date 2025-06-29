//server/routes/volunteers.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createVolunteerProfile,
  getMyVolunteerProfile,
  updateVolunteerProfile,
  updateVolunteerAvailability,
  applyToOfferService,
  removeOfferedService,
  getAllVolunteerProfiles,
  approveVolunteer,
  rejectVolunteer,
  getVolunteerProfileById
} = require('../controllers/volunteers');

// Public routes (none for volunteer profiles)

// Protected routes (authenticated users)
router.use(protect);

// Create volunteer profile
router.post('/profile', createVolunteerProfile);

// Get current user's volunteer profile
router.get('/my-profile', getMyVolunteerProfile);

// Update volunteer profile
router.put('/profile', updateVolunteerProfile);

// Update volunteer availability (volunteers only)
router.patch('/availability', authorize('volunteer', 'admin'), updateVolunteerAvailability);

// Apply to offer a service (volunteers only)
router.post('/apply-service', authorize('volunteer', 'admin'), applyToOfferService);

// Remove offered service (volunteers only)
router.delete('/remove-service', authorize('volunteer', 'admin'), removeOfferedService);

// Admin routes
router.get('/admin/profiles', authorize('admin'), getAllVolunteerProfiles);
router.get('/admin/profiles/:id', authorize('admin'), getVolunteerProfileById);
router.put('/admin/profiles/:id/approve', authorize('admin'), approveVolunteer);
router.put('/admin/profiles/:id/reject', authorize('admin'), rejectVolunteer);

module.exports = router;