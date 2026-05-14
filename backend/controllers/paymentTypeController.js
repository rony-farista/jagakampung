const prisma = require('../config/prisma');

/**
 * Get all payment types
 * GET /api/payment-types
 */
exports.getAllPaymentTypes = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const paymentTypes = await prisma.paymentType.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ paymentTypes, count: paymentTypes.length });
  } catch (error) {
    console.error('Get payment types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get payment type by ID
 * GET /api/payment-types/:id
 */
exports.getPaymentTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentType = await prisma.paymentType.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paymentType) {
      return res.status(404).json({ message: 'Payment type not found' });
    }

    res.json({ paymentType });
  } catch (error) {
    console.error('Get payment type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create payment type (Admin only)
 * POST /api/payment-types
 */
exports.createPaymentType = async (req, res) => {
  try {
    const { name, amount, frequency } = req.body;

    const paymentType = await prisma.paymentType.create({
      data: {
        name,
        amount,
        frequency
      }
    });

    res.status(201).json({
      message: 'Payment type created successfully',
      paymentType
    });
  } catch (error) {
    console.error('Create payment type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update payment type (Admin only)
 * PUT /api/payment-types/:id
 */
exports.updatePaymentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, frequency, isActive } = req.body;

    const paymentType = await prisma.paymentType.update({
      where: { id: parseInt(id) },
      data: { name, amount, frequency, isActive }
    });

    res.json({
      message: 'Payment type updated successfully',
      paymentType
    });
  } catch (error) {
    console.error('Update payment type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete payment type (Admin only)
 * DELETE /api/payment-types/:id
 */
exports.deletePaymentType = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.paymentType.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Payment type deleted successfully' });
  } catch (error) {
    console.error('Delete payment type error:', error);
    
    // Check if it's a foreign key constraint error
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'Cannot delete payment type with existing payments'
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
