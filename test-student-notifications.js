import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import User from './models/User.js';

async function testStudentNotifications() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smart-edu');

    // Find a student user
    const student = await User.findOne({ role: 'student' });
    console.log('Testing notifications for student:', student.name, 'Class:', student.classLevel, 'Role:', student.role);

    // Query notifications for this student (same logic as in student routes)
    const notificationQuery = {
      isActive: true,
      $or: [
        { 'target.scope': 'all' },
        { 'target.scope': 'class', 'target.classLevels': { $in: [student.classLevel] } },
        { 'target.scope': 'student', student: student._id }
      ]
    };

    console.log('Query:', JSON.stringify(notificationQuery, null, 2));
    console.log('Student classLevel:', student.classLevel, 'role:', student.role);

    const notifications = await Notification.find(notificationQuery)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📢 Found ${notifications.length} notifications for this student:`);
    notifications.forEach((n, i) => {
      console.log(`${i + 1}. [${n.type.toUpperCase()}] ${n.title}`);
      console.log(`   Target: ${n.target.scope} ${n.target.classLevels ? '(Classes: ' + n.target.classLevels.join(',') + ')' : n.target.roles ? '(Roles: ' + n.target.roles.join(',') + ')' : '(All)'}`);
      console.log(`   Active: ${n.isActive}, Expires: ${n.expiresAt}`);
      console.log('');
    });

    // Also check all notifications without expiry filter
    const allNotifications = await Notification.find({
      isActive: true,
      $or: [
        { 'target.scope': 'all' },
        { 'target.scope': 'class', 'target.classLevels': { $in: [student.classLevel] } },
        { 'target.scope': 'student', student: student._id }
      ]
    }).sort({ createdAt: -1 }).lean();

    console.log(`📢 Found ${allNotifications.length} notifications without expiry filter:`);
    allNotifications.forEach((n, i) => {
      console.log(`${i + 1}. [${n.type.toUpperCase()}] ${n.title} - Expires: ${n.expiresAt} (Expired: ${n.expiresAt < new Date()})`);
    });

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}

testStudentNotifications();
