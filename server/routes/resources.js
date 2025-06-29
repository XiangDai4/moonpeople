// server/routes/resources.js
const express = require('express');
const router = express.Router();
const { 
  getResources, 
  getResource, 
  createResource, 
  updateResource, 
  deleteResource,
  getAdminResources,
  togglePublishStatus
} = require('../controllers/resources');

const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getResources);
router.get('/:id', getResource);

// Protected routes
router.post('/', protect, createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

// Admin routes
router.get('/admin/all', protect, admin, getAdminResources);
router.put('/admin/toggle-publish/:id', protect, admin, togglePublishStatus);

module.exports = router;