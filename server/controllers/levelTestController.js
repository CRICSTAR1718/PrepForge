import User from "../models/User.js";
import { generateLevelTest } from "../services/levelTestGenerator.js";

const clampLevelDown = (level) => {
    if (level === "Advanced") return "Intermediate";
    if (level === "Intermediate") return "Beginner";
    return "Beginner";
};

// POST /api/level-test/run
// Body: { level }
// Returns: { passed: boolean, score: number, questions?: [...], suggestedLevel?: string }
// Side effect: persists level onboarding + test results to User.
export const runLevelTest = async (req, res) => {
    try {
        const { level } = req.body || {};

        const validLevels = ["Beginner", "Intermediate", "Advanced"];
        if (!level || !validLevels.includes(level)) {
            return res.status(400).json({ message: "Invalid level" });
        }

        // Persist selected level
        await User.findByIdAndUpdate(req.user.id, { level });

        // Generate MCQ test for Beginner/Intermediate/Advanced
        // (Previously Beginner was auto-skipped; now it also gets verified.)
        const test = await generateLevelTest(level);


        const answers = req.body?.answers;

        // If answers aren't provided yet, just return questions.
        if (!answers || typeof answers !== "object") {
            return res.status(200).json({
                passed: null,
                score: null,
                questions: test.questions,
                suggestedLevel: null,
            });
        }

        // Score: compare selected option keys (A-D) against answerKey.
        // Frontend sends answers like: { [questionId]: "A"|"B"|"C"|"D" }
        // Be tolerant of missing/undefined values.
        const total = test.questions.length;
        let correct = 0;

        for (const q of test.questions) {
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
            questions: test.questions,
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


