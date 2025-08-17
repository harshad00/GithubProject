export async function fetchCommitsFromGitHub({ username, repo, since, until, token }) {
  const baseURL = `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}`;
  const listURL = `${baseURL}/commits?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}`;

  const headers = {
    "User-Agent": "gh-commits-api",
    "Accept": "application/vnd.github+json"
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const listResp = await fetch(listURL, { headers });
  if (!listResp.ok) {
    const text = await listResp.text().catch(() => "");
    throw new Error(`GitHub API error (${listResp.status}): ${text || listResp.statusText}`);
  }

  const commits = await listResp.json();

  // ✅ Check if no commits found
  if (!Array.isArray(commits) || commits.length === 0) {
    throw new Error(`No commits found in ${repo} by ${username} for the given date range.`);
  }

  const fullCommits = await Promise.all(
    commits.map(async (c) => {
      const sha = c.sha;
      const commitURL = `${baseURL}/commits/${sha}`;
      const commitResp = await fetch(commitURL, { headers });

      if (!commitResp.ok) {
        const text = await commitResp.text().catch(() => "");
        throw new Error(`Error fetching commit details for ${sha}: ${text || commitResp.statusText}`);
      }

      const commitData = await commitResp.json();

      return {
        sha,
        message: c?.commit?.message || "",
        author: c?.commit?.author?.name || c?.author?.login || "Unknown",
        date: c?.commit?.author?.date || null,
        html_url: c?.html_url || null,
        files: (commitData.files || []).map(f => ({
          filename: f.filename,
          status: f.status,
          changes: f.changes,
          additions: f.additions,
          deletions: f.deletions,
          patch: f.patch || null
        }))
      };
    })
  );

  return fullCommits;
}
