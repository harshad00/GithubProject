
import { Router } from "express";


const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({ message: "Test route is working!" });
}
);

export default router;