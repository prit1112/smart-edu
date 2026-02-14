import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    question: {
      type: String,
      required: true
    },

    options: {
      type: [String],
      required: true,
      validate: v => v.length === 4
    },

    correctIndex: {
      type: Number,
      required: true
    },

    marks: {
      type: Number,
      default: 1
    },

    negativeMarks: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("MCQ", mcqSchema);
