import express from "express";
import { createPlan, getPlan, getMyPlan } from "../controllers/planController.js";
import  protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createPlan);
router.get("/my", getMyPlan);
router.get("/:id", getPlan);

export default router;