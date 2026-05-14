/**
 * Prisma Seed - Data awal untuk aplikasi RT
 * Run: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rt.com' },
    update: {},
    create: {
      name: 'Admin RT',
      email: 'admin@rt.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Bendahara
  const bendaharaPassword = await bcrypt.hash('bendahara123', 10);
  const bendahara = await prisma.user.upsert({
    where: { email: 'bendahara@rt.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'bendahara@rt.com',
      password: bendaharaPassword,
      role: 'BENDAHARA',
      isActive: true,
      phone: '081234567890',
    },
  });

  // Sample warga
  const wargaPassword = await bcrypt.hash('warga123', 10);
  const warga1 = await prisma.user.upsert({
    where: { email: 'budi@gmail.com' },
    update: {},
    create: {
      name: 'Budi Prasetyo',
      email: 'budi@gmail.com',
      password: wargaPassword,
      role: 'USER',
      isActive: true,
      nik: '3201234567890001',
      address: 'Jl. Mawar No. 1',
      phone: '081111111111',
    },
  });
  const warga2 = await prisma.user.upsert({
    where: { email: 'siti@gmail.com' },
    update: {},
    create: {
      name: 'Siti Rahayu',
      email: 'siti@gmail.com',
      password: wargaPassword,
      role: 'USER',
      isActive: true,
      nik: '3201234567890002',
      address: 'Jl. Mawar No. 2',
      phone: '081222222222',
    },
  });

  // Jenis iuran
  const iuranBulanan = await prisma.paymentType.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Iuran Bulanan', amount: 50000, frequency: 'monthly' },
  });
  const iuranKebersihan = await prisma.paymentType.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Iuran Kebersihan', amount: 25000, frequency: 'monthly' },
  });
  const iuranKeamanan = await prisma.paymentType.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Iuran Keamanan', amount: 30000, frequency: 'monthly' },
  });

  // Sample payments
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  await prisma.payment.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: warga1.id, paymentTypeId: iuranBulanan.id,
        amount: 50000, month: currentMonth, year: currentYear,
        paymentDate: new Date(), status: 'paid', receivedById: bendahara.id,
      },
      {
        userId: warga2.id, paymentTypeId: iuranBulanan.id,
        amount: 50000, month: currentMonth, year: currentYear,
        paymentDate: new Date(), status: 'pending',
      },
    ],
  });

  // Sample announcement
  await prisma.announcement.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Selamat Datang di RT App!',
        content: 'Aplikasi ini digunakan untuk mengelola data warga dan iuran RT. Silakan hubungi admin jika ada pertanyaan.',
        isPinned: true,
        createdBy: admin.id,
      },
      {
        title: 'Jadwal Kerja Bakti',
        content: 'Kerja bakti akan dilaksanakan setiap hari Minggu pertama setiap bulan. Mohon partisipasi seluruh warga.',
        isPinned: false,
        createdBy: admin.id,
      },
    ],
  });

  console.log('✅ Seed selesai!');
  console.log('👤 Admin    → admin@rt.com / admin123');
  console.log('💼 Bendahara → bendahara@rt.com / bendahara123');
  console.log('👥 Warga    → budi@gmail.com / warga123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
