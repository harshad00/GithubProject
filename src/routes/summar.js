
import { Router } from "express";
import { summaryofCommits } from "../controllers/summaryController.js";


const router = Router();

router.get("/summary", summaryofCommits);

export default router;