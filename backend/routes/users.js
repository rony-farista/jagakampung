const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { exportResidents } = require('../utils/exportHelper');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Save push token
router.post('/push-token', userController.savePushToken);

// Export residents data
router.get('/export', roleCheck('ADMIN'), exportResidents);

// Get all users (Admin only)
router.get('/', roleCheck('ADMIN'), userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', roleCheck('ADMIN'), userController.deleteUser);

// Change password
router.put('/:id/password', userController.changePassword);

module.exports = router;
