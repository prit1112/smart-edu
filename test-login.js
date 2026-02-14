import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function testLogin() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smart-edu');

    const email = 'test@example.com';
    const password = 'password123';

    console.log('Testing login with:', email, password);

    // Find user (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ User found:', user.name, user.email);

    // Check password
    const ok = await bcrypt.compare(password, user.password);
    if (ok) {
      console.log('✅ Password correct');
      console.log('Login successful!');
    } else {
      console.log('❌ Password incorrect');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
