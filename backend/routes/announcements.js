const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Get announcement by ID
router.get('/:id', announcementController.getAnnouncementById);

// Create announcement (Admin/Bendahara only)
router.post('/', roleCheck('ADMIN', 'BENDAHARA'), announcementController.createAnnouncement);

// Update announcement
router.put('/:id', roleCheck('ADMIN', 'BENDAHARA'), announcementController.updateAnnouncement);

// Delete announcement
router.delete('/:id', roleCheck('ADMIN', 'BENDAHARA'), announcementController.deleteAnnouncement);

module.exports = router;
