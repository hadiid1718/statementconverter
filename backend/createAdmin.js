const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@admin.com', role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('@admin#5656', 10);
    
    const adminUser = new User({
      email: 'admin@admin.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'admin',
      filesConverted: 0
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@admin.com');
    console.log('Password: @admin#5656');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the script
createAdminUser();
