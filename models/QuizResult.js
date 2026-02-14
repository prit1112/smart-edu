import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  },
  score: Number,
  totalMarks: Number,
  correct: Number,
  wrong: Number,
  attempted: Number
}, { timestamps: true });

export default mongoose.model("QuizResult", quizResultSchema);
