const prisma = require('../config/prisma');
const { sendPushNotification } = require('../utils/pushHelper');

/**
 * Get all announcements
 * GET /api/announcements
 */
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { isPinned } = req.query;
    
    const where = {};
    if (isPinned !== undefined) where.isPinned = isPinned === 'true';

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ announcements, count: announcements.length });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get announcement by ID
 * GET /api/announcements/:id
 */
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create announcement (Admin/Bendahara only)
 * POST /api/announcements
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, image, isPinned } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        image,
        isPinned: isPinned || false,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });

    // Kirim push notifikasi ke semua user aktif (background, tidak block response)
    prisma.user.findMany({
      where: { isActive: true, pushToken: { not: null } },
      select: { pushToken: true }
    }).then((users) => {
      const tokens = users.map((u) => u.pushToken).filter(Boolean);
      const prefix = announcement.isPinned ? '📌 ' : '📢 ';
      sendPushNotification(tokens, prefix + title, content, {
        announcementId: announcement.id
      });
    }).catch(console.error);

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update announcement
 * PUT /api/announcements/:id
 */
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image, isPinned } = req.body;

    // Check if announcement exists and user is creator or admin
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (existingAnnouncement.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { title, content, image, isPinned },
      include: {
        creator: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    res.json({
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete announcement
 * DELETE /api/announcements/:id
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if announcement exists and user is creator or admin
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (existingAnnouncement.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
