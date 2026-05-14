const express = require('express');
const router = express.Router();
const paymentTypeController = require('../controllers/paymentTypeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all payment types
router.get('/', paymentTypeController.getAllPaymentTypes);

// Get payment type by ID
router.get('/:id', paymentTypeController.getPaymentTypeById);

// Create payment type (Admin only)
router.post('/', roleCheck('ADMIN'), paymentTypeController.createPaymentType);

// Update payment type (Admin only)
router.put('/:id', roleCheck('ADMIN'), paymentTypeController.updatePaymentType);

// Delete payment type (Admin only)
router.delete('/:id', roleCheck('ADMIN'), paymentTypeController.deletePaymentType);

module.exports = router;
