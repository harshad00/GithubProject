import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  status: String,
  changes: Number,
  additions: Number,
  deletions: Number,
  patch: String,
}, { _id: false });

const commitSchema = new mongoose.Schema({
  sha: { type: String, required: true, unique: true },
  message: String,
  author: String,
  date: Date,
  html_url: String,
  files: [fileSchema],
  username: String,
  repo: String,
  fetchedAt: { type: Date, default: Date.now },

  // Reference to the authenticated user who fetched this
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Make sure you have a User model defined
    required: true,
  },
});

export default mongoose.model("Commit", commitSchema);
