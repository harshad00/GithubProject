// models/CommitSummary.js
import mongoose from "mongoose";

const commitSummarySchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    totalCommits: {
      type: Number,
      required: true,
    },
    repo: {
      type: String,
      required: true,
      trim: true,
    },
    githubusername: {
      type: String,
      required: true,
      trim: true,
    },
    commitId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Commit
      ref: "Commit",
      required: true,
    },
    version: {
      type: Number, // version number for history
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

// ✅ Allow multiple versions per commitId
// Each (commitId, version) pair must be unique
commitSummarySchema.index({ commitId: 1, version: 1 }, { unique: true });

export default mongoose.model("CommitSummary", commitSummarySchema);
