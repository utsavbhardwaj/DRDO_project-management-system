const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'admin' } });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123', salt);
      await prisma.user.create({
        data: {
          name: 'Administrator',
          email: 'admin',
          password: hashedPassword,
          role: 'Admin'
        }
      });
      console.log('✅ Default admin created (username: admin, password: 123)');
    } else {
      console.log('✅ Admin account already exists');
    }
  } catch (err) {
    console.error('Failed to seed admin:', err.message);
  }
};

module.exports = seedAdmin;
