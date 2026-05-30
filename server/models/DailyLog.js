import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
    {
        score: { type: Number, min: 0, max: 100 },
        feedback: { type: String },
        suggestions: [{ type: String }],
    },
    { _id: false }
);

const dailyLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            required: true,
        },
        date: {
            type: String, // "YYYY-MM-DD"
            required: true,
        },
        tasksCompleted: [{ type: String }],
        timeSpentMinutes: { type: Number, default: 0 },
        notes: { type: String, default: "" },
        difficultyRating: { type: Number, min: 1, max: 5, default: null },
        submitted: { type: Boolean, default: false },
        evaluationPending: { type: Boolean, default: false },
        evaluation: { type: evaluationSchema, default: null },
    },
    { timestamps: true }
);

// One log per user per day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyLog", dailyLogSchema);