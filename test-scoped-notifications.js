import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import User from './models/User.js';

async function createScopedNotifications() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smart-edu');

    const admin = await User.findOne({ role: 'admin' });
    console.log('Admin found:', admin.name);

    // Create class-specific notification
    const classNotification = await Notification.create({
      title: 'Class 1 Announcement',
      message: 'Special announcement for Class 1 students',
      type: 'warning',
      target: 'class',
      classLevel: 1,
      channels: { inApp: true, push: false, whatsapp: false },
      createdBy: admin._id
    });
    console.log('Class notification created:', classNotification._id);

    // Create all-students notification
    const allNotification = await Notification.create({
      title: 'School-wide Update',
      message: 'Important update for all students',
      type: 'urgent',
      target: 'all',
      channels: { inApp: true, push: true, whatsapp: false },
      createdBy: admin._id
    });
    console.log('All students notification created:', allNotification._id);

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}

createScopedNotifications();
