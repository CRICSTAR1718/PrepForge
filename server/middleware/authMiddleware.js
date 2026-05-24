import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try {
        // 1. Check if token exists in the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // 2. Extract the token
        const token = authHeader.split(" ")[1];

        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach the user to the request (excluding password)
        req.user = await User.findById(decoded.id).select("-passwordHash");

        if (!req.user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

export default protect;