import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

// ───────────────────────────────
// POST /api/auth/signup
// ───────────────────────────────
export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check all fields present
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        // 3. Create user (password gets hashed by the pre-save hook in User.js)
        const user = await User.create({ email, passwordHash: password });

        // 4. Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(201).json({
            message: "Account created successfully",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                domain: user.domain,
                planDuration: user.planDuration,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Signup failed", error: err.message });
    }
};

// ───────────────────────────────
// POST /api/auth/login
// ───────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check all fields present
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2. Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Compare password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4. Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                domain: user.domain,
                planDuration: user.planDuration,
                currentPlanId: user.currentPlanId,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

// ───────────────────────────────
// POST /api/auth/refresh
// ───────────────────────────────
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Issue a new access token
        const accessToken = generateAccessToken(decoded.id);

        res.status(200).json({ accessToken });
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};