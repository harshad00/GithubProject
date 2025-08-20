// controllers/summaryController.js
import Commit from "../models/Commit.js";
import CommitSummary from "../models/CommitSummary1.js";
import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const summaryofCommits = async (req, res) => {
  const { repo } = req.query;

  try {
    // 🔹 Fetch commits from DB
    const repoData = await Commit.findOne({ repo });

    if (!repoData || !repoData.commits || repoData.commits.length === 0) {
      return res.status(404).json({ message: "No commits found for this repository" });
    }

    console.log("Fetched repo data:", repoData);

    const { commits, username, _id } = repoData;

    const checkedCommitsSummary = await CommitSummary.findOne({
      commitId: _id,
    });

    // ✅ CASE 1: If summary already exists → check for new commits
    if (checkedCommitsSummary) {
      console.log("Summary already exists for this commit ID:", _id);

      // Find latest version for this repo + commitId
      const latestSummary = await CommitSummary.findOne({ commitId: _id })
        .sort({ version: -1 }); // get highest version
      console.log("Latest summary found:", latestSummary);
      

      if (latestSummary.totalCommits !== commits.length) {
        console.log("New commits found, generating new versioned summary");

        const newCommits = commits.slice(latestSummary.totalCommits);

        if (newCommits.length > 0) {
          const prompt = `
You are an AI assistant that summarizes only new GitHub commits.

Repository: ${repo}
User: ${username}

Here are the new commits:
${newCommits.map((commit, i) => `
Commit ${i + 1}:
- SHA: ${commit.sha}
- Author: ${commit.author}
- Date: ${commit.date?.$date || commit.date}
- Message: ${commit.message}
- Files Changed:
${commit.files?.map(file => `
   • ${file.filename} (${file.status}, ${file.changes} changes, +${file.additions}, -${file.deletions})
`).join("")}
`).join("\n")}

---
Please provide a concise structured summary of these commits.
`;

          // Call Gemini API
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );

          if (!response.ok) {
            const err = await response.text();
            console.error("Gemini API error:", err);
            return res.status(500).json({ message: "Gemini API request failed", error: err });
          }

          const data = await response.json();
          const aiNewSummary =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated";

          // Save a NEW versioned summary
          const newSummary = new CommitSummary({
            summary: aiNewSummary,
            totalCommits: commits.length,
            repo,
            commitId: _id,
            githubusername: username,
            version: latestSummary.version + 1,
          });

          console.log("New summary to be saved:", newSummary);

          await newSummary.save();

          return res.status(200).json({
            message: "New summary version created",
            newSummary,
          });
        }
      }

      // No new commits → return latest version
      return res.status(200).json(latestSummary);
    }

    // ✅ CASE 2: First time → create initial summary
    console.log("No summary exists yet, generating first-time summary...");

    const initialPrompt = `
You are an AI assistant that summarizes GitHub commit history.

Repository: ${repo}
User: ${username}

Here are the commits:
${commits.map((commit, i) => `
Commit ${i + 1}:
- SHA: ${commit.sha}
- Author: ${commit.author}
- Date: ${commit.date?.$date || commit.date}
- Message: ${commit.message}
- Files Changed:
${commit.files?.map(file => `
   • ${file.filename} (${file.status}, ${file.changes} changes, +${file.additions}, -${file.deletions})
`).join("")}
`).join("\n")}

---
Please provide a clear structured summary of this commit history.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: initialPrompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return res.status(500).json({ message: "Gemini API request failed", error: err });
    }

    const data = await response.json();
    const aiInitialSummary =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated";

    const firstSummary = new CommitSummary({
      summary: aiInitialSummary,
      totalCommits: commits.length,
      repo,
      githubusername: username,
      commitId: _id,
      version: 1, // ✅ first-time version = 1
    });

    await firstSummary.save();

    return res.status(200).json({
      message: "First-time summary created",
      firstSummary,
    });

  } catch (error) {
    console.error("Error summarizing commits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
