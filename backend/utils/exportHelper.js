const api = require('../config/prisma');
const PDFDocument = require('pdfkit');

const prisma = require('../config/prisma');

/**
 * Export laporan pembayaran ke PDF
 * GET /api/payments/export?year=2025&month=5
 */
exports.exportPaymentReport = async (req, res) => {
  try {
    const { year, month, paymentTypeId } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const where = { year: currentYear };
    if (month) where.month = parseInt(month);
    if (paymentTypeId) where.paymentTypeId = parseInt(paymentTypeId);

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: { select: { name: true, nik: true, address: true } },
        paymentType: { select: { name: true } },
        receivedBy: { select: { name: true } },
      },
      orderBy: [{ month: 'asc' }, { user: { name: 'asc' } }],
    });

    // Build PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-iuran-${currentYear}${month ? '-' + month : ''}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('LAPORAN IURAN RT', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(
      `Periode: ${month ? `Bulan ${month} ` : ''}Tahun ${currentYear}`,
      { align: 'center' }
    );
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    // Summary
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

    doc.fontSize(11);
    doc.text(`Total Transaksi : ${payments.length}`);
    doc.text(`Total Lunas    : Rp ${totalPaid.toLocaleString('id-ID')}`);
    doc.text(`Total Tertunggak: Rp ${totalPending.toLocaleString('id-ID')}`);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    // Table header
    const col = { no: 40, name: 65, type: 225, month: 325, amount: 390, status: 480 };
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('No', col.no, doc.y, { width: 20 });
    doc.text('Nama Warga', col.name, doc.y - doc.currentLineHeight(), { width: 155 });
    doc.text('Jenis', col.type, doc.y - doc.currentLineHeight(), { width: 95 });
    doc.text('Bln', col.month, doc.y - doc.currentLineHeight(), { width: 60 });
    doc.text('Nominal', col.amount, doc.y - doc.currentLineHeight(), { width: 90 });
    doc.text('Status', col.status, doc.y - doc.currentLineHeight(), { width: 75 });
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica').fontSize(9);
    payments.forEach((p, i) => {
      const y = doc.y;
      doc.text(`${i + 1}`, col.no, y, { width: 20 });
      doc.text(p.user?.name || '-', col.name, y, { width: 155 });
      doc.text(p.paymentType?.name || '-', col.type, y, { width: 95 });
      doc.text(p.month ? `${p.month}/${p.year}` : `${p.year}`, col.month, y, { width: 60 });
      doc.text(`Rp ${Number(p.amount).toLocaleString('id-ID')}`, col.amount, y, { width: 90 });
      doc.text(p.status === 'paid' ? 'Lunas' : 'Belum', col.status, y, { width: 75 });
      doc.moveDown(0.4);

      if (doc.y > 750) {
        doc.addPage();
        doc.moveDown(0.5);
      }
    });

    doc.moveDown(1);
    doc.fontSize(10).text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Gagal generate PDF' });
    }
  }
};

/**
 * Export data warga ke JSON (bisa dipakai di frontend jadi Excel via SheetJS)
 * GET /api/users/export
 */
exports.exportResidents = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true, name: true, nik: true, kk: true,
        address: true, phone: true, email: true,
        isActive: true, createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ users, count: users.length, exportedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ message: 'Gagal export data warga' });
  }
};
