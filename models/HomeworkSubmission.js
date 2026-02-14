import mongoose from "mongoose";

const homeworkSubmissionSchema = new mongoose.Schema({
  homework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Homework",
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  file: {
    type: String,
    required: false // Allow text-only submissions
  },
  textAnswer: {
    type: String,
    trim: true,
    required: false // Allow file-only submissions
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["submitted", "late", "not_submitted"],
    default: "submitted"
  },
  marksObtained: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
homeworkSubmissionSchema.index({ student: 1 });
homeworkSubmissionSchema.index({ homework: 1 });
homeworkSubmissionSchema.index({ status: 1 });

const HomeworkSubmission = mongoose.model("HomeworkSubmission", homeworkSubmissionSchema);

export default HomeworkSubmission;
