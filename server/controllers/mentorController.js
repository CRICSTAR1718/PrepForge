import { getMentorReply } from "../services/mentorService.js";
import DailyLog from "../models/DailyLog.js";
import Plan from "../models/Plan.js";

export const chat = async (req, res) => {
    try {
        const { messages } = req.body;
        const userId = req.user._id || req.user.id;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "messages array is required" });
        }

        // Gather context: current plan + recent scores
        let context = {
            domain: req.user.domain || "General",
            planDuration: req.user.planDuration || 30,
            currentDay: null,
            recentScores: [],
            todayTopic: null,
        };

        if (req.user.currentPlanId) {
            try {
                const plan = await Plan.findById(req.user.currentPlanId);
                if (plan) {
                    // Figure out which day the user is on
                    const createdAt = new Date(plan.createdAt);
                    const now = new Date();
                    const diffMs = now - createdAt;
                    const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
                    context.currentDay = Math.min(daysPassed, plan.durationDays);

                    // Today's topic
                    const todayPlan = plan.days.find((d) => d.day === context.currentDay);
                    if (todayPlan) context.todayTopic = todayPlan.topic;
                }
            } catch (planError) {
                console.warn("[MentorController] Could not fetch plan context:", planError.message);
            }
        }

        // Recent 3 submitted logs with scores
        try {
            const recentLogs = await DailyLog.find({
                userId: userId,
                submitted: true,
                "evaluation.score": { $exists: true },
            })
                .sort({ date: -1 })
                .limit(3)
                .select("date evaluation.score");

            context.recentScores = recentLogs.map((l) => ({
                date: l.date,
                score: l.evaluation?.score,
            }));
        } catch (logsError) {
            console.warn("[MentorController] Could not fetch recent scores:", logsError.message);
        }

        console.log("[MentorController] Chat request with context:", {
            domain: context.domain,
            currentDay: context.currentDay,
            messageCount: messages.length,
        });

        const reply = await getMentorReply(messages, context);

        res.json({ reply });
    } catch (err) {
        console.error("[MentorController] Chat error:", {
            message: err.message,
            stack: err.stack,
        });
        res.status(500).json({ message: "Mentor unavailable. Try again shortly." });
    }
};