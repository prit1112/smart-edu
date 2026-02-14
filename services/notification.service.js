import webpush from 'web-push';
import twilio from 'twilio';
import Notification from '../models/Notification.js';
import NotificationSeen from '../models/NotificationSeen.js';
import User from '../models/User.js';

// Configure web-push (only if VAPID keys are available)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@smartedu.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Configure Twilio (only if credentials are available)
let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

class NotificationService {
  /**
   * Create and send notification to target audience
   */
  async createAndSendNotification(notificationData, adminId) {
    try {
      // Create notification in database
      const notification = await Notification.create({
        ...notificationData,
        createdBy: adminId
      });

      // Get target users
      const targetUsers = await this.getTargetUsers(notification);

      // Send notifications through enabled channels
      const results = {
        inApp: 0,
        push: 0,
        whatsapp: 0
      };

      for (const user of targetUsers) {
        // In-App notification (always sent if enabled)
        if (notification.channels.inApp && user.notificationPrefs.inApp) {
          results.inApp++;
        }

        // Push notification
        if (notification.channels.push && user.notificationPrefs.push && user.pushSubscription) {
          try {
            await this.sendPushNotification(user.pushSubscription, notification);
            results.push++;
          } catch (error) {
            console.error('Push notification failed for user:', user._id, error);
          }
        }

        // WhatsApp notification
        if (notification.channels.whatsapp && user.notificationPrefs.whatsapp && user.phone) {
          try {
            await this.sendWhatsAppMessage(user.phone, notification);
            results.whatsapp++;
          } catch (error) {
            console.error('WhatsApp notification failed for user:', user._id, error);
          }
        }
      }

      return {
        notificationId: notification._id,
        sent: results,
        totalUsers: targetUsers.length
      };

    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get users based on notification target
   */
  async getTargetUsers(notification) {
    let query = { role: 'student' }; // Only students receive notifications

    if (notification.target.scope === 'class') {
      query.classLevel = { $in: notification.target.classLevels };
    } else if (notification.target.scope === 'student') {
      query._id = notification.student;
    }
    // For 'all', no additional filters

    return await User.find(query).lean();
  }

  /**
   * Send push notification to user
   */
  async sendPushNotification(subscription, notification) {
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        notificationId: notification._id,
        url: '/student/notifications'
      }
    });

    await webpush.sendNotification(subscription, payload);
  }

  /**
   * Send WhatsApp message to user
   */
  async sendWhatsAppMessage(phone, notification) {
    // Format phone number (ensure it starts with +)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const message = `📢 *SmartEdu Update*\n\n*${notification.title}*\n\n${notification.message}\n\n_Sent by SmartEdu Admin_`;

    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
      body: message
    });
  }

  /**
   * Get notifications for a student
   */
  async getStudentNotifications(studentId, filters = {}) {
    const { filter = 'all', page = 1, limit = 20 } = filters;

    // Build query
    const classLevels = await this.getStudentClassLevels(studentId);
    const student = await User.findById(studentId).select('role').lean();
    let query = {
      isActive: true,
      $or: [
        { 'target.scope': 'all' },
        { 'target.scope': 'class', 'target.classLevels': { $in: classLevels } },
        { 'target.scope': 'role', 'target.roles': { $in: [student.role] } },
        { 'target.scope': 'student', student: studentId }
      ]
    };

    // Apply filters
    if (filter === 'unread') {
      const seenNotificationIds = await NotificationSeen.find({ student: studentId }).distinct('notification');
      query._id = { $nin: seenNotificationIds };
    } else if (filter === 'urgent') {
      query.type = 'urgent';
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Add seen status
    const seenMap = {};
    const seenRecords = await NotificationSeen.find({
      student: studentId,
      notification: { $in: notifications.map(n => n._id) }
    }).lean();

    seenRecords.forEach(seen => {
      seenMap[seen.notification.toString()] = seen.seenAt;
    });

    const notificationsWithSeen = notifications.map(notification => ({
      ...notification,
      isSeen: !!seenMap[notification._id.toString()],
      seenAt: seenMap[notification._id.toString()]
    }));

    // Group by date
    const grouped = {};
    notificationsWithSeen.forEach(notification => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(notification);
    });

    return {
      notifications: notificationsWithSeen,
      grouped,
      pagination: {
        page,
        limit,
        hasMore: notifications.length === limit
      }
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(studentId, notificationId) {
    await NotificationSeen.findOneAndUpdate(
      { student: studentId, notification: notificationId },
      { student: studentId, notification: notificationId },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Get student's class levels (for class-specific notifications)
   */
  async getStudentClassLevels(studentId) {
    const student = await User.findById(studentId).select('classLevel').lean();
    return student ? [student.classLevel] : [];
  }

  /**
   * Save push subscription for user
   */
  async savePushSubscription(userId, subscription) {
    await User.findByIdAndUpdate(userId, {
      pushSubscription: subscription,
      'notificationPrefs.push': true
    });
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPrefs(userId, prefs) {
    await User.findByIdAndUpdate(userId, {
      notificationPrefs: prefs
    });
  }

  /**
   * Get notification statistics for admin
   */
  async getNotificationStats() {
    const totalNotifications = await Notification.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'student' });
    const activeSubscriptions = await User.countDocuments({
      role: 'student',
      pushSubscription: { $exists: true }
    });
    const whatsappEnabled = await User.countDocuments({
      role: 'student',
      'notificationPrefs.whatsapp': true,
      phone: { $exists: true, $ne: null }
    });

    return {
      totalNotifications,
      totalUsers,
      activeSubscriptions,
      whatsappEnabled
    };
  }
}

export default new NotificationService();
