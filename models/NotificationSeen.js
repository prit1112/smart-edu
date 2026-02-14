import mongoose from "mongoose";

const notificationSeenSchema = new mongoose.Schema({
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  seenAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for performance and uniqueness
notificationSeenSchema.index({ student: 1, notification: 1 }, { unique: true });

const NotificationSeen = mongoose.model("NotificationSeen", notificationSeenSchema);

export default NotificationSeen;
