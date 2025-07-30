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

    const commits = await fetchCommitsFromGitHub({
      username,
      repo,
      since,
      until,
      token: process.env.GITHUB_TOKEN || undefined
    });

    if (!commits.length) {
      return res.status(200).json({
        date: dateLabel,
        message: "No commits found for yesterday.",
        commits: []
      });
      }

    // Save commits to MongoDB
    for (const c of commits) {
      try {
        await Commit.updateOne(
          { sha: c.sha }, // prevent duplicates
          {
            ...c,
            username,
            userId: userId,
            repo,
            fetchedAt: new Date()
          },
          { upsert: true } // insert if not exists
        );
      } catch (dbErr) {
        console.error(`DB error for commit ${c.sha}:`, dbErr.message);
      }
    }

    return res.status(200).json({
      date: dateLabel,
      count: commits.length,
      commits
    });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ message: "Failed to fetch commits from GitHub" });
  }
}
