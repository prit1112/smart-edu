import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "student"],
    default: "student"
  },
  classLevel: Number,
  phone: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  otpHash: String,
  otpExpiresAt: Date,
  otpAttempts: {
    type: Number,
    default: 0
  },
  resendCount: {
    type: Number,
    default: 0
  },
  lastResendAt: Date,
  pushSubscription: Object,
  notificationPrefs: {
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
  }
}, { timestamps: true });

// Indexes
userSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup

export default mongoose.model("User", userSchema);
