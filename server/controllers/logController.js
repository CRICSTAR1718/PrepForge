import DailyLog from "../models/DailyLog.js";
import Plan from "../models/Plan.js";

// Helper: get today's date as "YYYY-MM-DD"
const getTodayString = () => new Date().toISOString().split("T")[0];

// GET /api/logs/today
export const getOrCreateTodayLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getTodayString();

        // 1. Check if a log already exists for today
        let log = await DailyLog.findOne({ userId, date: today });

        if (log) {
            const plan = await Plan.findById(log.planId);
            const planStartDate = new Date(plan.createdAt).toISOString().split("T")[0];
            const msPerDay = 1000 * 60 * 60 * 24;
            const dayIndex = Math.floor((new Date(today) - new Date(planStartDate)) / msPerDay);
            const todayPlanDay = plan.days[dayIndex] || null;

            if (todayPlanDay?.tasks) {
                todayPlanDay.tasks = todayPlanDay.tasks.map((t) =>
                    typeof t === "string" ? t : t.title || t.description || JSON.stringify(t)
                );
            }

            return res.status(200).json({ success: true, data: log, planDay: todayPlanDay });
        }

        // 2. No log yet — fetch the user's active plan
        const plan = await Plan.findOne({ userId }).sort({ createdAt: -1 });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "No active plan found. Please generate a plan first.",
            });
        }

        // 3. Figure out which day of the plan today is (Day 1, Day 2, etc.)
        const planStartDate = new Date(plan.createdAt).toISOString().split("T")[0];
        const msPerDay = 1000 * 60 * 60 * 24;
        const dayIndex =
            Math.floor(
                (new Date(today) - new Date(planStartDate)) / msPerDay
            );

        // 4. Get today's tasks from the plan
        const todayPlanDay = plan.days[dayIndex] || null;
        // Normalize tasks to strings regardless of what OpenAI returned
        if (todayPlanDay?.tasks) {
            todayPlanDay.tasks = todayPlanDay.tasks.map((t) =>
                typeof t === "string" ? t : t.title || t.description || JSON.stringify(t)
            );
        }
        const prefillTasks = todayPlanDay ? todayPlanDay.tasks : [];

        // 5. Create a fresh draft log pre-filled with today's tasks
        log = await DailyLog.create({
            userId,
            planId: plan._id,
            date: today,
            tasksCompleted: [],   // none checked yet
            timeSpentMinutes: 0,
            notes: "",
            submitted: false,
        });

        // 6. Return the log + today's plan tasks so frontend can show the checklist
        return res.status(201).json({
            success: true,
            data: log,
            planDay: todayPlanDay,   // { day, topic, tasks[], estimatedMinutes }
        });
    } catch (error) {
        console.error("getOrCreateTodayLog error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// PUT /api/logs/:id
export const saveDraftLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { tasksCompleted, timeSpentMinutes, notes, difficultyRating } = req.body;

        // 1. Find the log and make sure it belongs to this user
        const log = await DailyLog.findOne({ _id: id, userId });

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Log not found.",
            });
        }

        // 2. Block edits if already submitted
        if (log.submitted) {
            return res.status(400).json({
                success: false,
                message: "This log has already been submitted and cannot be edited.",
            });
        }

        // 3. Update only the fields that were sent
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


// POST /api/logs/:id/submit
export const submitLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const log = await DailyLog.findOne({ _id: id, userId });
        if (!log) {
            return res.status(404).json({ success: false, message: "Log not found." });
        }
        if (log.submitted) {
            return res.status(400).json({
                success: false,
                message: "Already submitted.",
            });
        }

        log.submitted = true;
        log.evaluationPending = true;
        await log.save();

        return res.status(200).json({ success: true, data: log });
    } catch (error) {
        console.error("submitLog error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/logs
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