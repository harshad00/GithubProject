// controllers/summaryController.js
import Commit from "../models/Commit.js";
import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const summaryofCommits = async (req, res) => {
  const { repo } = req.query;

  try {
    // 🔹 Fetch commits from DB
   // Fetch commit document (assuming 1 repo = 1 doc)
const repoData = await Commit.findOne({ repo });

if (!repoData || !repoData.commits || repoData.commits.length === 0) {
  return res.status(404).json({ message: "No commits found for this repository" });
}

const { commits, username } = repoData;  // 🔹 extract correctly

    // // 🔹 Prepare commit messages (map + join)
    // const commitMessages = commits
    //   .map((c, i) => `${i + 1}. ${c.message || "(no message)"}`)
    //   .slice(0, 50) // limit for safety
    //   .join("\n");

    // 🔹 Build prompt
   const prompt = `
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
Please provide a **clear summary** of this commit history, including:
1. A short overall summary (2–3 sentences).
2. Key features/changes added or removed.
3. Any important technical improvements or fixes.
4. Group related commits together (if possible).
5. Highlight major file changes (like config, README, analytics, etc.).

Keep the summary **concise, structured, and human-friendly**.
`;


    // 🔹 Call Gemini API (API key in query param ✅)
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
      return res
        .status(500)
        .json({ message: "Gemini API request failed", error: err });
    }

    const data = await response.json();
    const aiSummary =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated";

    res.status(200).json({
  summary: aiSummary,
  totalCommits: commits.length,
  repo,
  githubusername: username,
});

  } catch (error) {
    console.error("Error summarizing commits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
