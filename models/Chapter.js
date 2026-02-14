import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
  title: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  }
});

export default mongoose.model("Chapter", chapterSchema);
