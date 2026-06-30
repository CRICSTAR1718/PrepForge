import User from "../models/User.js";
import { generateLevelTest } from "../services/levelTestGenerator.js";

const clampLevelDown = (level) => {
    if (level === "Advanced") return "Intermediate";
    if (level === "Intermediate") return "Beginner";
    return "Beginner";
};

// POST /api/level-test/run
// Body: { level } OR { level, answers, questions }
// Returns: { passed: boolean, score: number, questions?: [...], suggestedLevel?: string }
// Side effect: persists level onboarding + test results to User.
export const runLevelTest = async (req, res) => {
    try {
        const { level, answers, questions: submittedQuestions } = req.body || {};

        const validLevels = ["Beginner", "Intermediate", "Advanced"];
        if (!level || !validLevels.includes(level)) {
            return res.status(400).json({ message: "Invalid level" });
        }

        // Persist selected level
        await User.findByIdAndUpdate(req.user.id, { level });

        // No answers yet -> first call, generate and return questions
        if (!answers || typeof answers !== "object") {
            const test = await generateLevelTest(level);
            return res.status(200).json({
                passed: null,
                score: null,
                questions: test.questions,
                suggestedLevel: null,
            });
        }

        // Scoring call -> MUST use the SAME questions the user was shown,
        // not a freshly-regenerated set (that was the bug causing bogus scores).
        if (!Array.isArray(submittedQuestions) || submittedQuestions.length === 0) {
            return res.status(400).json({ message: "Missing original questions for scoring." });
        }

        const total = submittedQuestions.length;
        let correct = 0;

        for (const q of submittedQuestions) {
            const userPick = answers[q.id];
            const answerKey = q.answerKey;
            if (!userPick || !answerKey) continue;
            if (String(userPick).trim().toUpperCase() === String(answerKey).trim().toUpperCase()) {
                correct += 1;
            }
        }

        const score = Math.round((correct / total) * 100);
        const passed = score >= 50;
        const lowerLevel = clampLevelDown(level);

        await User.findByIdAndUpdate(req.user.id, {
            levelTestScore: score,
            levelTestCompleted: true,
            level: passed ? level : lowerLevel,
        });

        return res.status(200).json({
            passed,
            score,
            questions: submittedQuestions,
            suggestedLevel: passed ? undefined : lowerLevel,
        });
    } catch (err) {
        const msg = err?.message || "Unknown error";
        console.error("[runLevelTest] error", err);

        // Bubble up more actionable errors for the frontend.
        if (msg.toLowerCase().includes("gemini")) {
            return res.status(500).json({ message: `Gemini error: ${msg}` });
        }
        if (msg.toLowerCase().includes("invalid mcq")) {
            return res.status(500).json({ message: `Level test generation failed: ${msg}` });
        }

        return res.status(500).json({ message: msg });
    }
};