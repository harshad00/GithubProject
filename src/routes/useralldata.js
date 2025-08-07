import { Router } from "express";
import { getAllUserCommitById, getCommitsByRepoName } from "../controllers/mygithubController.js";

const router = Router();

router.get("/all", getAllUserCommitById);
router.get("/byreponame", getCommitsByRepoName);

export default router;