const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { exportPaymentReport } = require('../utils/exportHelper');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get payment statistics
router.get('/stats', paymentController.getPaymentStats);

// Get unpaid residents
router.get('/unpaid', roleCheck('ADMIN', 'BENDAHARA'), paymentController.getUnpaidResidents);

// Export payment report as PDF
router.get('/export', roleCheck('ADMIN', 'BENDAHARA'), exportPaymentReport);

// Get payments by user
router.get('/user/:userId', paymentController.getPaymentsByUser);

// Get all payments
router.get('/', paymentController.getAllPayments);

// Create payment (Admin/Bendahara only)
router.post('/', roleCheck('ADMIN', 'BENDAHARA'), paymentController.createPayment);

// Update payment (Admin/Bendahara only)
router.put('/:id', roleCheck('ADMIN', 'BENDAHARA'), paymentController.updatePayment);

// Delete payment (Admin only)
router.delete('/:id', roleCheck('ADMIN'), paymentController.deletePayment);

module.exports = router;
