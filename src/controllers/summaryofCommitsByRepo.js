import CommitSummary1 from "../models/CommitSummary1.js";

 const summaryofCommitsByRepo = async (req, res) => {
    const { repo } = req.query;
    
    try {
        // 🔹 Fetch commit summaries for the specified repo
        const summaries = await CommitSummary1.find({ repo });
    
        if (!summaries || summaries.length === 0) {
        return res.status(404).json({ message: "No commit summaries found for this repository" });
        }
    
        console.log("Fetched commit summaries:", summaries);
    
        res.status(200).json(summaries);
    } catch (error) {
        console.error("Error fetching commit summaries:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
    
export { summaryofCommitsByRepo };