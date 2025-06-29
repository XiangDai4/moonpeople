// server/routes/forum.js
const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  createReply,
  toggleFavorite,
  getUserFavorites,
  toggleLockPost,
  deletePost,
  deleteReply,
  getUserDirectReplies
} = require('../controllers/forum');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.get('/users/replies', protect, getUserDirectReplies);


// Protected routes (authenticated users only)
router.post('/posts', protect, createPost);
router.post('/posts/:id/reply', protect, createReply);
router.post('/posts/:id/favorite', protect, toggleFavorite);
router.get('/favorites', protect, getUserFavorites);

// Admin only routes
router.put('/posts/:id/lock', protect, admin, toggleLockPost);
router.delete('/posts/:id', protect, admin, deletePost);
router.delete('/replies/:id', protect, admin, deleteReply);

module.exports = router;