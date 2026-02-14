import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["info", "warning", "urgent"],
    default: "info"
  },
  target: {
    scope: {
      type: String,
      enum: ["all", "class", "student", "role"],
      required: true
    },
    classLevels: [Number], // only populated when scope is "class"
    roles: [String], // only populated when scope is "role"
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }, // only populated when target.scope is "student"
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for performance
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ target: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
