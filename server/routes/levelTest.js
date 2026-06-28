import express from "express";
import protect from "../middleware/authMiddleware.js";
import { runLevelTest } from "../controllers/levelTestController.js";

const router = express.Router();

router.post("/run", protect, runLevelTest);

export default router;

