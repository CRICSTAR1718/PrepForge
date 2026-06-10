import express from "express";
import {
    getOrCreateTodayLog,
    saveDraftLog,
    submitLog,
    getLogById,   
    getAllLogs,
} from "../controllers/logController.js";
import protect  from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, getOrCreateTodayLog);
router.get("/:id", protect, getLogById);
router.get("/", protect, getAllLogs);
router.put("/:id", protect, saveDraftLog);
router.post("/:id/submit", protect, submitLog);

export default router;
