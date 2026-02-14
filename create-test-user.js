import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smart-edu');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'student',
      classLevel: 10
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('Role: student');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

createTestUser();
