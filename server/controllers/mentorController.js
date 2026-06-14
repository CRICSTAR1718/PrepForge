import { getMentorReply } from "../services/mentorService.js";
import DailyLog from "../models/DailyLog.js";
import Plan from "../models/Plan.js";

export const chat = async (req, res) => {
    try {
        const { messages } = req.body;
        const user = req.user;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "messages array is required" });
        }

        // Gather context: current plan + recent scores
        let context = {
            domain: user.domain || "General",
            planDuration: user.planDuration || 30,
            currentDay: null,
            recentScores: [],
            todayTopic: null,
        };

        if (user.currentPlanId) {
            const plan = await Plan.findById(user.currentPlanId);
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
        }

        // Recent 3 submitted logs with scores
        const recentLogs = await DailyLog.find({
            userId: user._id,
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

        const reply = await getMentorReply(messages, context);

        res.json({ reply });
    } catch (err) {
        console.error("Mentor chat error:", err);
        res.status(500).json({ message: "Mentor unavailable. Try again shortly." });
    }
};