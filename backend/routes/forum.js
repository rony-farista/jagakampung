const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all posts
router.get('/', forumController.getAllPosts);

// Get post by ID
router.get('/:id', forumController.getPostById);

// Create post
router.post('/', forumController.createPost);

// Delete post
router.delete('/:id', forumController.deletePost);

// Add comment to post
router.post('/:id/comments', forumController.addComment);

// Delete comment
router.delete('/:postId/comments/:commentId', forumController.deleteComment);

// Toggle like on post
router.post('/:id/like', forumController.toggleLike);

module.exports = router;
