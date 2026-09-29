const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

const adminsToAdd = [
  { email: 'dkdubey.sspl@gov.in',  name: 'DK Dubey' },
  { email: 'rs.saxena.sspl@gov.in', name: 'RS Saxena' },
];

const addAdmins = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    for (const admin of adminsToAdd) {
      const existing = await prisma.user.findUnique({ where: { email: admin.email } });
      if (existing) {
        console.log(`⚠️  User already exists: ${admin.email} — skipping`);
        continue;
      }
      await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: 'Admin',
          isVerified: true,
        },
      });
      console.log(`✅ Admin created: ${admin.email}`);
    }
  } catch (err) {
    console.error('❌ Failed to add admins:', err.message);
  } finally {
    await prisma.$disconnect();
  }
};

addAdmins();
