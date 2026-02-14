import mongoose from 'mongoose';
import User from './models/User.js';

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smart-edu');
    const users = await User.find({}, 'name email role').lean();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name}: ${user.email} (${user.role})`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
