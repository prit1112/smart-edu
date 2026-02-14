import mongoose from 'mongoose';
import Notification from './models/Notification.js';

async function checkNotifications() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smart-edu');
    console.log('✅ Connected to MongoDB');

    const notifications = await Notification.find().lean();
    console.log(`📢 Found ${notifications.length} notifications:`);

    notifications.forEach((n, i) => {
      console.log(`${i+1}. [${n.type.toUpperCase()}] ${n.title}`);
      console.log(`   Target: ${n.target.scope} ${n.target.classLevels ? '(Classes: ' + n.target.classLevels.join(',') + ')' : n.target.roles ? '(Roles: ' + n.target.roles.join(',') + ')' : '(All)'}`);
      console.log(`   Active: ${n.isActive}`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNotifications();
