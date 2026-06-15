const prisma = require('../config/prisma');

exports.getAllPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category && category !== 'semua') where.category = category;

    const posts = await prisma.forumPost.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: { select: { id: true, name: true, role: true } },
        comments: {
          include: {
            creator: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const like = await prisma.forumLike.findUnique({
      where: { postId_userId: { postId: post.id, userId: req.user.id } }
    });

    res.json({ post: { ...post, isLiked: !!like } });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category: category || 'umum',
        createdBy: req.user.id
      },
      include: {
        creator: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.forumPost.findUnique({ where: { id: parseInt(id) } });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.forumPost.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await prisma.forumPost.findUnique({ where: { id: parseInt(id) } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.forumComment.create({
      data: {
        postId: parseInt(id),
        content,
        createdBy: req.user.id
      },
      include: {
        creator: { select: { id: true, name: true, role: true } }
      }
    });

    await prisma.forumPost.update({
      where: { id: parseInt(id) },
      data: { commentsCount: { increment: 1 } }
    });

    res.status(201).json({ message: 'Comment added', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await prisma.forumComment.findUnique({ where: { id: parseInt(commentId) } });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.forumComment.delete({ where: { id: parseInt(commentId) } });

    await prisma.forumPost.update({
      where: { id: parseInt(postId) },
      data: { commentsCount: { decrement: 1 } }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);
    const userId = req.user.id;

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingLike = await prisma.forumLike.findUnique({
      where: { postId_userId: { postId, userId } }
    });

    let liked;
    let updatedPost;

    if (existingLike) {
      await prisma.forumLike.delete({ where: { postId_userId: { postId, userId } } });
      updatedPost = await prisma.forumPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });
      liked = false;
    } else {
      await prisma.forumLike.create({ data: { postId, userId } });
      updatedPost = await prisma.forumPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });
      liked = true;
    }

    res.json({ liked, likesCount: updatedPost.likesCount });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
