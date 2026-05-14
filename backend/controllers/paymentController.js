const prisma = require('../config/prisma');

/**
 * Get all payments with filters
 * GET /api/payments
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { userId, status, month, year, paymentTypeId } = req.query;
    
    const where = {};
    
    if (userId) where.userId = parseInt(userId);
    if (status) where.status = status;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (paymentTypeId) where.paymentTypeId = parseInt(paymentTypeId);

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        paymentType: true,
        receivedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    res.json({ payments, count: payments.length });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get payments by user ID
 * GET /api/payments/user/:userId
 */
exports.getPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Regular users can only see their own payments
    if (req.user.role === 'USER' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: parseInt(userId) },
      include: {
        paymentType: true,
        receivedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    res.json({ payments, count: payments.length });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create payment (Admin/Bendahara only)
 * POST /api/payments
 */
exports.createPayment = async (req, res) => {
  try {
    const { userId, paymentTypeId, amount, month, year, paymentDate, status, notes } = req.body;

    const payment = await prisma.payment.create({
      data: {
        userId: parseInt(userId),
        paymentTypeId: parseInt(paymentTypeId),
        amount,
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        paymentDate: new Date(paymentDate),
        status: status || 'paid',
        receivedById: req.user.id,
        notes
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        paymentType: true,
        receivedBy: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update payment
 * PUT /api/payments/:id
 */
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, month, year, paymentDate, status, notes } = req.body;

    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        amount,
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        status,
        notes
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        paymentType: true,
        receivedBy: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete payment (Admin only)
 * DELETE /api/payments/:id
 */
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.payment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get payment statistics
 * GET /api/payments/stats
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : null;

    const where = { year: currentYear };
    if (currentMonth) where.month = currentMonth;

    // Total payments
    const totalPayments = await prisma.payment.aggregate({
      where: { ...where, status: 'paid' },
      _sum: { amount: true },
      _count: true
    });

    // Pending payments
    const pendingPayments = await prisma.payment.aggregate({
      where: { ...where, status: 'pending' },
      _sum: { amount: true },
      _count: true
    });

    // Total warga
    const totalWarga = await prisma.user.count({
      where: { role: 'USER', isActive: true }
    });

    // Warga yang sudah bayar
    const paidWarga = await prisma.payment.groupBy({
      by: ['userId'],
      where: { ...where, status: 'paid' },
      _count: true
    });

    // Monthly breakdown (for current year)
    const monthlyBreakdown = await prisma.payment.groupBy({
      by: ['month'],
      where: { year: currentYear, status: 'paid' },
      _sum: { amount: true },
      _count: true,
      orderBy: { month: 'asc' }
    });

    res.json({
      stats: {
        totalPaid: totalPayments._sum.amount || 0,
        totalPaidCount: totalPayments._count,
        totalPending: pendingPayments._sum.amount || 0,
        totalPendingCount: pendingPayments._count,
        totalWarga,
        paidWarga: paidWarga.length,
        unpaidWarga: totalWarga - paidWarga.length,
        monthlyBreakdown
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get unpaid residents for specific payment type
 * GET /api/payments/unpaid
 */
exports.getUnpaidResidents = async (req, res) => {
  try {
    const { paymentTypeId, month, year } = req.query;
    
    if (!paymentTypeId || !month || !year) {
      return res.status(400).json({ 
        message: 'Payment type, month, and year are required' 
      });
    }

    // Get all active users
    const allUsers = await prisma.user.findMany({
      where: { role: 'USER', isActive: true },
      select: { id: true, name: true, email: true, phone: true, address: true }
    });

    // Get users who already paid
    const paidUsers = await prisma.payment.findMany({
      where: {
        paymentTypeId: parseInt(paymentTypeId),
        month: parseInt(month),
        year: parseInt(year),
        status: 'paid'
      },
      select: { userId: true }
    });

    const paidUserIds = new Set(paidUsers.map(p => p.userId));

    // Filter unpaid users
    const unpaidUsers = allUsers.filter(user => !paidUserIds.has(user.id));

    res.json({ 
      unpaidResidents: unpaidUsers, 
      count: unpaidUsers.length 
    });
  } catch (error) {
    console.error('Get unpaid residents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
