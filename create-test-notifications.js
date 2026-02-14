import mongoose from "mongoose";
import Notification from "./models/Notification.js";
import User from "./models/User.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-edu";

async function createTestNotifications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get admin user
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("❌ No admin user found. Please create an admin user first.");
      return;
    }

    // Create test notifications
    const notifications = [
      {
        title: "Welcome to SmartEdu!",
        message: "Welcome to your new learning platform. Explore subjects, take quizzes, and track your progress.",
        type: "info",
        target: { scope: "all" },
        channels: { inApp: true, push: false, whatsapp: false },
        createdBy: admin._id
      },
      {
        title: "New Quiz Available",
        message: "A new quiz has been added to Mathematics Chapter 1. Test your knowledge!",
        type: "info",
        target: { scope: "class", classLevels: [10] },
        channels: { inApp: true, push: false, whatsapp: false },
        createdBy: admin._id
      },
      {
        title: "Homework Due Tomorrow",
        message: "Don't forget to submit your Physics homework. Deadline is tomorrow at 11:59 PM.",
        type: "warning",
        target: { scope: "class", classLevels: [10] },
        channels: { inApp: true, push: false, whatsapp: false },
        createdBy: admin._id
      },
      {
        title: "Exam Schedule Updated",
        message: "Important: Mid-term exam schedule has been updated. Check the latest schedule in your dashboard.",
        type: "urgent",
        target: { scope: "all" },
        channels: { inApp: true, push: false, whatsapp: false },
        createdBy: admin._id
      },
      {
        title: "New Study Material Available",
        message: "Chemistry study materials for Chapter 3 have been uploaded. Download and start studying!",
        type: "info",
        target: { scope: "class", classLevels: [10] },
        channels: { inApp: true, push: false, whatsapp: false },
        createdBy: admin._id
      }
    ];

    for (const notificationData of notifications) {
      const existing = await Notification.findOne({
        title: notificationData.title,
        message: notificationData.message
      });

      if (!existing) {
        await Notification.create(notificationData);
        console.log(`✅ Created notification: ${notificationData.title}`);
      } else {
        console.log(`⚠️  Notification already exists: ${notificationData.title}`);
      }
    }

    console.log("🎉 Test notifications creation completed!");
  } catch (error) {
    console.error("❌ Error creating test notifications:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createTestNotifications();
