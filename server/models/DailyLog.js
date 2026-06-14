// server/models/DailyLog.js
// Updated for Phase 4 — adds plannedTasks, dayNumber, evaluationPending

import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
    {
        score: { type: Number, min: 0, max: 100, default: null },
        feedback: { type: String, default: '' },
        suggestions: { type: [String], default: [] },
    },
    { _id: false }
);

const dailyLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            default: null,
        },
        date: {
            type: Date,
            required: true,
        },
        dayNumber: {
            type: Number,
            default: null,
        },
        // Tasks from the plan for this day (pre-populated on creation)
        plannedTasks: {
            type: [String],
            default: [],
        },
        // Tasks the user actually completed
        tasksCompleted: {
            type: [String],
            default: [],
        },
        timeSpentMinutes: {
            type: Number,
            default: 0,
            min: 0,
        },
        notes: {
            type: String,
            default: '',
        },
        difficultyRating: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
        },
        submitted: {
            type: Boolean,
            default: false,
        },
        // True while Gemini is processing — frontend polls until this is false
        evaluationPending: {
            type: Boolean,
            default: false,
        },
        evaluation: {
            type: evaluationSchema,
            default: null,
        },
    },
    { timestamps: true }
);

// One log per plan day. A user can complete multiple plan days on the same date.
dailyLogSchema.index(
    { userId: 1, planId: 1, dayNumber: 1 },
    { unique: true, partialFilterExpression: { planId: { $exists: true, $ne: null } } }
);

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);
export default DailyLog;
