
import { Router } from "express";
import { summaryofCommits } from "../controllers/summaryController.js";
import { summaryofCommitsByRepo } from "../controllers/summaryofCommitsByRepo.js"


const router = Router();

router.get("/summary", summaryofCommits);
router.get("/summarybyrepo", summaryofCommitsByRepo);

export default router;