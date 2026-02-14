import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  }
}, { timestamps: true });

export default mongoose.model("Video", videoSchema);
