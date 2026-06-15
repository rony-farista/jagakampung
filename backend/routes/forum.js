const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', forumController.getAllPosts);
router.get('/:id', forumController.getPostById);
router.post('/', forumController.createPost);
router.delete('/:id', forumController.deletePost);
router.post('/:id/comments', forumController.addComment);
router.delete('/:postId/comments/:commentId', forumController.deleteComment);
router.post('/:id/like', forumController.toggleLike);

module.exports = router;
