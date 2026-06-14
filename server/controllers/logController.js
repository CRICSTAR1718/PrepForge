import DailyLog from "../models/DailyLog.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";
import { evaluateLog } from "../services/evaluator.js";

const normalizeTasks = (tasks = []) =>
    tasks.map((task) =>
        typeof task === "string" ? task : task.title || task.description || JSON.stringify(task)
    );

const getPlanDay = (plan, dayNumber) =>
    plan?.days?.find((day) => day.day === dayNumber) || plan?.days?.[dayNumber - 1] || null;

const getPlanDayTasks = (planDay) => normalizeTasks(planDay?.tasks || []);

const getLogDateForPlanDay = (plan, dayNumber) => {
    const date = new Date(plan.createdAt);
    date.setDate(date.getDate() + dayNumber - 1);
    return date;
};

const attachNormalizedTasks = (planDay) => {
    if (!planDay) return null;
    const plainDay = planDay.toObject ? planDay.toObject() : { ...planDay };
    plainDay.tasks = getPlanDayTasks(planDay);
    return plainDay;
};

const findNextDayNumber = async (userId, plan) => {
    const submittedLogs = await DailyLog.find({
        userId,
        planId: plan._id,
        submitted: true,
        dayNumber: { $ne: null },
    }).select("dayNumber");

    const completedDays = new Set(submittedLogs.map((log) => log.dayNumber));
    const nextDay = plan.days.find((day) => !completedDays.has(day.day));
    return nextDay?.day ?? null;
};

const syncDraftTasks = async (log, planDay) => {
    if (!log || log.submitted) return log;

    const plannedTasks = getPlanDayTasks(planDay);
    const sameTasks =
        plannedTasks.length === log.plannedTasks.length &&
        plannedTasks.every((task, index) => task === log.plannedTasks[index]);

    if (!sameTasks) {
        log.plannedTasks = plannedTasks;
        await log.save();
    }

    return log;
};

const appendSuggestionsToNextPlanDay = async (plan, currentDayNumber, suggestions = []) => {
    const nextPlanDay = getPlanDay(plan, currentDayNumber + 1);
    if (!nextPlanDay || suggestions.length === 0) return;

    const existingTitles = new Set(
        getPlanDayTasks(nextPlanDay).map((task) => task.trim().toLowerCase())
    );

    const suggestionTasks = suggestions
        .map((suggestion) => suggestion?.trim())
        .filter(Boolean)
        .filter((suggestion) => {
            const key = suggestion.toLowerCase();
            if (existingTitles.has(key)) return false;
            existingTitles.add(key);
            return true;
        })
        .map((suggestion) => ({
            title: suggestion,
            description: "Suggested by AI based on your previous result.",
        }));

    if (suggestionTasks.length === 0) return;

    nextPlanDay.tasks.push(...suggestionTasks);
    await plan.save();

    // If there are any existing draft logs for the next day, update them
    // so the suggested tasks appear without replacing other tasks.
    await DailyLog.updateMany(
        {
            userId: plan.userId,
            planId: plan._id,
            dayNumber: nextPlanDay.day,
            submitted: false,
        },
        { $set: { plannedTasks: getPlanDayTasks(nextPlanDay) } }
    );
};

export const getOrCreateTodayLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const plan = await Plan.findOne({ userId }).sort({ createdAt: -1 });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "No active plan found. Please generate a plan first.",
            });
        }

        // Prefer the most recent unsubmitted draft (latest dayNumber/createdAt)
        // so users progress to the next day even if an older draft lingers.
        // If there's a log already for today's date (submitted or not),
        // return it. This prevents the tracker from advancing to the next
        // plan day until the calendar day has rolled over.
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        let log = await DailyLog.findOne({
            userId,
            planId: plan._id,
            date: { $gte: startOfToday, $lt: startOfTomorrow },
        });

        if (!log) {
            // Prefer the most recent unsubmitted draft (latest dayNumber/createdAt)
            // so users progress to the next day even if an older draft lingers.
            log = await DailyLog.findOne({
                userId,
                planId: plan._id,
                submitted: false,
            }).sort({ dayNumber: -1, createdAt: -1 });
        }

        if (log) {
            const planDay = getPlanDay(plan, log.dayNumber);
            await syncDraftTasks(log, planDay);

            return res.status(200).json({
                success: true,
                data: log,
                planDay: attachNormalizedTasks(planDay),
            });
        }

        const nextDayNumber = await findNextDayNumber(userId, plan);
        if (!nextDayNumber) {
            return res.status(200).json({
                success: true,
                data: null,
                planDay: null,
                message: "All plan days are complete.",
            });
        }

        const planDay = getPlanDay(plan, nextDayNumber);
        log = await DailyLog.create({
            userId,
            planId: plan._id,
            date: getLogDateForPlanDay(plan, nextDayNumber),
            dayNumber: nextDayNumber,
            plannedTasks: getPlanDayTasks(planDay),
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
            planDay: attachNormalizedTasks(planDay),
        });
    } catch (error) {
        console.error("getOrCreateTodayLog error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

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

        log.submitted = true;
        log.evaluationPending = true;
        await log.save();

        res.status(200).json({ success: true, data: log });

        try {
            const user = await User.findById(userId);
            const domain = user?.domain || "DSA";
            const plan = log.planId ? await Plan.findById(log.planId) : null;
            const planDay = plan ? getPlanDay(plan, log.dayNumber) : null;
            const plannedTasks = getPlanDayTasks(planDay);

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

            if (plan) {
                await appendSuggestionsToNextPlanDay(plan, log.dayNumber, evaluation.suggestions);
            }

            console.log(`Evaluation done for log ${id} - Score: ${evaluation.score}`);
        } catch (evalError) {
            console.error(`Evaluation failed for log ${id}:`, evalError.message);
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

export const getAllLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const logs = await DailyLog.find({ userId }).sort({ dayNumber: -1, date: -1 });
        return res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error("getAllLogs error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
