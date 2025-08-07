import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  status: String,
  changes: Number,
  additions: Number,
  deletions: Number,
  patch: String,
}, { _id: false });

const singleCommitSchema = new mongoose.Schema({
  sha: { type: String, required: true },
  message: String,
  author: String,
  date: Date,
  html_url: String,
  files: [fileSchema],
}, { _id: false });

const commit = new mongoose.Schema({
  repo: { type: String, required: true },
  username: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commits: [singleCommitSchema],
  fetchedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Commit", commit);
