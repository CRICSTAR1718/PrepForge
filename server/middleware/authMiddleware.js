import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try {
        // 1. Check if token exists in the Authorization header
        const authHeader = req.headers.authorization;
        // console.log("[authMiddleware] Authorization header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("[authMiddleware] Missing or malformed Authorization header");
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // 2. Extract the token
        const token = authHeader.split(" ")[1];

        // 3. Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (verifyError) {
            console.warn("[authMiddleware] Token verification failed:", verifyError.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }

        // 4. Attach the user to the request (excluding password)
        req.user = await User.findById(decoded.id).select("-passwordHash");

        if (!req.user) {
            console.warn("[authMiddleware] User not found for token id", decoded.id);
            return res.status(401).json({ message: "User no longer exists" });
        }

        next();
    } catch (err) {
        console.error("[authMiddleware] Unexpected error:", err);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

export default protect;