import { yesterdayRangeISO } from "../utils/date.js";
import { fetchCommitsFromGitHub } from "../services/github.js";
import Commit from "../models/Commit.js";

export async function getYesterdayCommits(req, res) {
  const userId = req.user?.id;

  try {
    const { username, repo, tzOffset } = req.query;

    if (!username || !repo) {
      return res.status(400).json({ message: "username and repo are required" });
    }

    const tzOffsetMinutes = Number.isFinite(Number(tzOffset)) ? Number(tzOffset) : 0;
    const { since, until, dateLabel } = yesterdayRangeISO(tzOffsetMinutes);

    // console.log("Fetching commits for:", { username, repo, since, until, tzOffset });

    const commits = await fetchCommitsFromGitHub({
      username,
      repo,
      since,
      until,
      token: process.env.GITHUB_TOKEN || undefined
    });

    // console.log("THIS IS MY COMMIT:", commits);

    // Step 1: Find existing document
    let commitDoc = await Commit.findOne({ userId, username, repo });

    if (!commitDoc) {
      // Step 2: Create new document
      commitDoc = new Commit({
        userId,
        username,
        repo,
        commits,
        fetchedAt: new Date(),
      });
    } else {
      // Step 3: Add only new commits (skip duplicates)
      const existingShas = new Set(commitDoc.commits.map(c => c.sha));
      const newCommits = commits.filter(c => !existingShas.has(c.sha));
      commitDoc.commits.push(...newCommits);
      commitDoc.fetchedAt = new Date();
    }

    await commitDoc.save();

    return res.status(200).json({
      date: dateLabel,
      count: commits.length,
      commits
    });

  } catch (err) {
    console.error(err);

    // If error was thrown for "No commits found" — return 404
    if (err.message.startsWith("No commits found")) {
      return res.status(404).json({
        date: yesterdayRangeISO(
          Number.isFinite(Number(req.query.tzOffset)) ? Number(req.query.tzOffset) : 0
        ).dateLabel,
        message: "No commits found for yesterday.",
        commits: []
      });
    }

    return res.status(502).json({ message: "Failed to fetch commits from GitHub" });
  }
}
