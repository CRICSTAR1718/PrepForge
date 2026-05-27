import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        resourceUrl: { type: String },
    },
    { _id: false }
);

const daySchema = new mongoose.Schema(
    {
        day: { type: Number, required: true },
        topic: { type: String, required: true },
        tasks: [taskSchema],
        estimatedMinutes: { type: Number, required: true },
    },
    { _id: false }
);

const planSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        domain: {
            type: String,
            enum: ["DSA", "Full Stack", "Aptitude"],
            required: true,
        },
        durationDays: {
            type: Number,
            min: 15,
            max: 90,
            required: true,
        },
        days: [daySchema],
    },
    { timestamps: true }
);

export default mongoose.model("Plan", planSchema);