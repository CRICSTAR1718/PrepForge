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
            domain: "General",
            planDuration: 30,
            currentDay: null,
            recentScores: [],
            todayTopic: null,
        };

        if (req.user.currentPlanId) {
            try {
                const plan = await Plan.findById(req.user.currentPlanId);
                if (plan) {
                    context.domain = plan.domain || "General";
                    context.planDuration = plan.durationDays || 30;

                    // Use the latest submitted log's dayNumber as currentDay
                    // This is accurate regardless of when the plan was created
                    const latestLog = await DailyLog.findOne({
                        userId,
                        planId: plan._id,
                        submitted: true,
                    })
                        .sort({ dayNumber: -1 })
                        .select("dayNumber");
                    console.log("[DEBUG] latestLog:", latestLog); // ADD THIS LINE

                    if (latestLog) {
                        context.currentDay = latestLog.dayNumber;
                    } else {
                        // No submitted logs yet — check for a draft (today's log)
                        const draftLog = await DailyLog.findOne({
                            userId,
                            planId: plan._id,
                            submitted: false,
                        })
                            .sort({ dayNumber: -1 })
                            .select("dayNumber");

                        context.currentDay = draftLog ? draftLog.dayNumber : 1;
                    }

                    // Get today's topic from the plan using currentDay
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
                userId,
                submitted: true,
                "evaluation.score": { $exists: true },
            })
                .sort({ dayNumber: -1 })
                .limit(3)
                .select("date dayNumber evaluation.score");

            context.recentScores = recentLogs.map((l) => ({
                date: l.date,
                dayNumber: l.dayNumber,
                score: l.evaluation?.score,
            }));
        } catch (logsError) {
            console.warn("[MentorController] Could not fetch recent scores:", logsError.message);
        }

        console.log("[MentorController] Chat request with context:", {
            domain: context.domain,
            currentDay: context.currentDay,
            todayTopic: context.todayTopic,
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