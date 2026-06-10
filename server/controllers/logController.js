// server/controllers/logController.js

import DailyLog from "../models/DailyLog.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";
import { evaluateLog } from "../services/evaluator.js";

// Helper: get today's date as "YYYY-MM-DD"
const getTodayString = () => new Date().toISOString().split("T")[0];

// Helper: normalize plan tasks to plain strings
const normalizeTasks = (tasks = []) =>
    tasks.map((t) =>
        typeof t === "string" ? t : t.title || t.description || JSON.stringify(t)
    );

// ─────────────────────────────────────────────
// GET /api/logs/today
// Returns today's log if it exists, or creates a fresh one
// ─────────────────────────────────────────────
export const getOrCreateTodayLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getTodayString();

        // Check if a log already exists for today
        let log = await DailyLog.findOne({ userId, date: today });

        if (log) {
            const plan = await Plan.findById(log.planId);
            const planStartDate = new Date(plan.createdAt).toISOString().split("T")[0];
            const msPerDay = 1000 * 60 * 60 * 24;
            const dayIndex = Math.floor(
                (new Date(today) - new Date(planStartDate)) / msPerDay
            );
            const todayPlanDay = plan.days[dayIndex] || null;

            if (todayPlanDay?.tasks) {
                todayPlanDay.tasks = normalizeTasks(todayPlanDay.tasks);
            }

            return res.status(200).json({ success: true, data: log, planDay: todayPlanDay });
        }

        // No log yet — fetch the user's active plan
        const plan = await Plan.findOne({ userId }).sort({ createdAt: -1 });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "No active plan found. Please generate a plan first.",
            });
        }

        // Figure out which day of the plan today is
        const planStartDate = new Date(plan.createdAt).toISOString().split("T")[0];
        const msPerDay = 1000 * 60 * 60 * 24;
        const dayIndex = Math.floor(
            (new Date(today) - new Date(planStartDate)) / msPerDay
        );

        // Get today's plan tasks
        const todayPlanDay = plan.days[dayIndex] || null;
        if (todayPlanDay?.tasks) {
            todayPlanDay.tasks = normalizeTasks(todayPlanDay.tasks);
        }

        const plannedTasks = todayPlanDay?.tasks || [];

        // Create a fresh draft log
        log = await DailyLog.create({
            userId,
            planId: plan._id,
            date: today,
            dayNumber: dayIndex + 1,
            plannedTasks,
            tasksCompleted: [],
            timeSpentMinutes: 0,
            notes: "",
            difficultyRating: 3,
            submitted: false,
            evaluationPending: false,
        });

        return res.status(201).json({
            success: true,
            data: log,
            planDay: todayPlanDay,
        });
    } catch (error) {
        console.error("getOrCreateTodayLog error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────
// PUT /api/logs/:id
// Save draft — no evaluation triggered
// ─────────────────────────────────────────────
export const saveDraftLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { tasksCompleted, timeSpentMinutes, notes, difficultyRating } = req.body;

        const log = await DailyLog.findOne({ _id: id, userId });

        if (!log) {
            return res.status(404).json({ success: false, message: "Log not found." });
        }

        if (log.submitted) {
            return res.status(400).json({
                success: false,
                message: "This log has already been submitted and cannot be edited.",
            });
        }

        if (tasksCompleted !== undefined) log.tasksCompleted = tasksCompleted;
        if (timeSpentMinutes !== undefined) log.timeSpentMinutes = timeSpentMinutes;
        if (notes !== undefined) log.notes = notes;
        if (difficultyRating !== undefined) log.difficultyRating = difficultyRating;

        await log.save();

        return res.status(200).json({ success: true, data: log });
    } catch (error) {
        console.error("saveDraftLog error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────
// POST /api/logs/:id/submit
// Submits the log, then calls Gemini in the background
// Client gets an instant response — polls GET /logs/:id for result
// ─────────────────────────────────────────────
export const submitLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const log = await DailyLog.findOne({ _id: id, userId });
        if (!log) {
            return res.status(404).json({ success: false, message: "Log not found." });
        }
        if (log.submitted) {
            return res.status(400).json({ success: false, message: "Already submitted." });
        }

        // Mark submitted immediately so frontend knows it's locked
        log.submitted = true;
        log.evaluationPending = true;
        await log.save();

        // Respond to the client right away — don't make them wait for Gemini
        res.status(200).json({ success: true, data: log });

        // ── Run Gemini evaluation in background ──────────────────────────────
        try {
            const user = await User.findById(userId);
            const domain = user?.domain || "DSA";

            // Get this day's planned tasks from the plan for evaluation context
            let plannedTasks = [];
            if (log.planId) {
                const plan = await Plan.findById(log.planId);
                if (plan) {
                    const planStartDate = new Date(plan.createdAt).toISOString().split("T")[0];
                    const msPerDay = 1000 * 60 * 60 * 24;
                    const dayIndex = Math.floor(
                        (new Date(log.date) - new Date(planStartDate)) / msPerDay
                    );
                    const todayPlan = plan.days[dayIndex];
                    if (todayPlan?.tasks) {
                        plannedTasks = normalizeTasks(todayPlan.tasks);
                    }
                }
            }

            const evaluation = await evaluateLog({
                domain,
                plannedTasks,
                tasksCompleted: log.tasksCompleted,
                timeSpentMinutes: log.timeSpentMinutes,
                notes: log.notes,
                difficultyRating: log.difficultyRating,
            });

            log.evaluation = {
                score: evaluation.score,
                feedback: evaluation.feedback,
                suggestions: evaluation.suggestions,
            };
            log.evaluationPending = false;
            await log.save();

            console.log(`✅ Evaluation done for log ${id} — Score: ${evaluation.score}`);
        } catch (evalError) {
            // Gemini failed — save error state so frontend doesn't poll forever
            console.error(`❌ Evaluation failed for log ${id}:`, evalError.message);
            log.evaluation = {
                score: null,
                feedback: "Evaluation failed. Please try again later.",
                suggestions: [],
            };
            log.evaluationPending = false;
            await log.save();
        }
    } catch (error) {
        console.error("submitLog error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────
// GET /api/logs/:id
// Fetch a single log by ID — used by frontend to poll for evaluation result
// ─────────────────────────────────────────────
export const getLogById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const log = await DailyLog.findOne({ _id: id, userId });
        if (!log) {
            return res.status(404).json({ success: false, message: "Log not found." });
        }

        return res.status(200).json({ success: true, data: log });
    } catch (error) {
        console.error("getLogById error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────
// GET /api/logs
// Fetch all logs for the current user — used by dashboard
// ─────────────────────────────────────────────
export const getAllLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const logs = await DailyLog.find({ userId }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error("getAllLogs error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
