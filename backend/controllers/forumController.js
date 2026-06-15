const prisma = require('../config/prisma');

// GET /api/forum
const getAllPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};

    const posts = await prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    res.json(posts);
  } catch (error) {
    console.error('getAllPosts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/forum/:id
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: { select: { id: true, name: true, role: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            creator: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    const like = await prisma.forumLike.findUnique({
      where: { postId_userId: { postId: post.id, userId } },
    });

    res.json({ ...post, isLiked: !!like });
  } catch (error) {
    console.error('getPostById error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/forum
const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const createdBy = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title dan content wajib diisi' });
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category: category || 'umum',
        createdBy,
      },
      include: {
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('createPost error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/forum/:id
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    if (post.createdBy !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Tidak memiliki izin untuk menghapus post ini' });
    }

    await prisma.forumPost.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Post berhasil dihapus' });
  } catch (error) {
    console.error('deletePost error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/forum/:id/comments
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const createdBy = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content komentar wajib diisi' });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    const [comment] = await prisma.$transaction([
      prisma.forumComment.create({
        data: { postId: parseInt(id), content, createdBy },
        include: {
          creator: { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.forumPost.update({
        where: { id: parseInt(id) },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    res.status(201).json(comment);
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/forum/:postId/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await prisma.forumComment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    if (comment.createdBy !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Tidak memiliki izin untuk menghapus komentar ini' });
    }

    await prisma.$transaction([
      prisma.forumComment.delete({ where: { id: parseInt(commentId) } }),
      prisma.forumPost.update({
        where: { id: parseInt(postId) },
        data: { commentsCount: { decrement: 1 } },
      }),
    ]);

    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    console.error('deleteComment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/forum/:id/like
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const postId = parseInt(id);

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    const existingLike = await prisma.forumLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingLike) {
      await prisma.$transaction([
        prisma.forumLike.delete({ where: { postId_userId: { postId, userId } } }),
        prisma.forumPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      res.json({ isLiked: false, message: 'Like dihapus' });
    } else {
      await prisma.$transaction([
        prisma.forumLike.create({ data: { postId, userId } }),
        prisma.forumPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
      res.json({ isLiked: true, message: 'Post disukai' });
    }
  } catch (error) {
    console.error('toggleLike error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  addComment,
  deleteComment,
  toggleLike,
};
