/**
 * Script to create an admin user in the database.
 * Run: node scripts/createAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@admin#5656';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL, role: 'admin' });
    if (existing) {
      console.log('Admin user already exists:', ADMIN_EMAIL);
      return;
    }

    const hashedPassword = await User.hashPassword(ADMIN_PASSWORD);

    await User.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      fullName: ADMIN_NAME,
      role: 'admin',
      filesConverted: 0,
    });

    console.log('✅ Admin user created successfully');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();
