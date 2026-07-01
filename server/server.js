import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import planRoutes from "./routes/plans.js";
import logRoutes from "./routes/logs.js";
import mentorRouter from "./routes/mentor.js";
import levelTestRouter from "./routes/levelTest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const clientDistPath = path.resolve(__dirname, "../client/dist");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/mentor", mentorRouter);
app.use("/api/level-test", levelTestRouter);


if (existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
}

app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }

    if (existsSync(clientDistPath)) {
        return res.sendFile(path.join(clientDistPath, "index.html"));
    }

    return next();
});

// Health check for Gemini API key
app.get("/api/health/gemini", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({
        geminiConfigured: hasKey,
        message: hasKey ? "Gemini API key is configured" : "Gemini API key is NOT configured",
    });
});

// Test Gemini endpoint
app.get("/api/test/gemini", async (req, res) => {
    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Say hello briefly");
        res.json({
            success: true,
            message: result.response.text(),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

const PORT = process.env.PORT ?? 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});