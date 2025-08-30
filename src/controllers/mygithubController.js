
import  Commit  from '../models/Commit.js';

export const getAllUserCommitById = async (req, res) => {
  const { userId } = req.query;

  try {
    const commits = await Commit.find({ userId });

    if (!commits || commits.length === 0) {
      return res.status(404).json({ message: "No commits found for this user" });
    }

    res.status(200).json({ commits }); // ✅ return commits array
  } catch (error) {
    console.error("Error fetching commits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getCommitsByRepoName = async (req, res) => {
    const { repoName } = req.query;
    try {
        const commits = await Commit.find({ repo: repoName });

        if (!commits || commits.length === 0) {
            return res.status(404).json({ message: 'No commits found for this repository' });
        }
        res.status(200).json({ commits });
    } catch (error) {
        console.error('Error fetching commits:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getDataByGithibUserNameAndRepoName = async (req, res) => {
    const { githubusername, repo } = req.query;
    try {
        const commits = await Commit.find({ githubUsername: githubusername, repo: repo });

        if (!commits || commits.length === 0) {
            return res.status(404).json({ message: 'No commits found for this user and repository' });
        }
        res.status(200).json({ commits });
    } catch (error) {
        console.error('Error fetching commits:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}