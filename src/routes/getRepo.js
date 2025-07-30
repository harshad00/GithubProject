import { Router } from "express";
import { getYesterdayCommits } from "../controllers/githubController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/github/commits?username=USER&repo=REPO[&tzOffset=MINUTES]
router.get("/commits", authenticate , getYesterdayCommits);

export default router;
