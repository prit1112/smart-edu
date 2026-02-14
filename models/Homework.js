import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  classLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
homeworkSchema.index({ classLevel: 1 });
homeworkSchema.index({ subject: 1 });
homeworkSchema.index({ chapter: 1 });
homeworkSchema.index({ dueDate: 1 });
homeworkSchema.index({ isActive: 1 });

const Homework = mongoose.model("Homework", homeworkSchema);

export default Homework;
