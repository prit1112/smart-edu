import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: String,
  file: String,
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  }
}, { timestamps: true });

export default mongoose.model("Note", noteSchema);
