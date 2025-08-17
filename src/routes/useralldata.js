import { Router } from "express";
import { getAllUserCommitById, getCommitsByRepoName, getDataByGithibUserNameAndRepoName } from "../controllers/mygithubController.js";

const router = Router();

router.get("/all", getAllUserCommitById);
router.get("/byreponame", getCommitsByRepoName);
router.get("/bygithubusernameandreponame", getDataByGithibUserNameAndRepoName);

export default router;