import jwt from 'jsonwebtoken'
import User from '../models/userModel.js';


// User Auth
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized , no token"
            })
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🛠️ FIX: Robustly extract the user ID by checking for common keys (id, userId, _id)
        const userIdFromToken = decoded.id || decoded.userId || decoded._id;


        // 🚨 DEBUG STEP 1: Log the ID being extracted from the token
        // console.log("DEBUG: JWT Decoded ID (Attempted):", userIdFromToken);

        // Check if a valid ID was found at all
        if (!userIdFromToken) {
            // console.warn("DEBUG: Token decoded but no valid ID field (id, userId, or _id) found in payload.");
            return res.status(401).json({ success: false, message: "Invalid token structure: Missing user identifier." });
        }


        req.user = await User.findById(userIdFromToken).select("-password");

        if (!req.user) {
            // 🚨 DEBUG STEP 2: Log if the ID lookup failed
            // console.warn(`DEBUG: User lookup failed for ID: ${userIdFromToken}. Check if user exists in DB.`);

            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        }

        // 🚨 DEBUG STEP 3: Log success
        // console.log(`DEBUG: User found: ${req.user.email} (${req.user._id})`);

        next();

    } catch (error) {
        // This usually catches expired or malformed tokens
        console.error("Auth middleware error (Invalid Token):", error.message);
        return res.status(401).json({
            success: false,
            message: "Not authorized."
        })
    }
}

// Allow Only Admin Users
export const adminOnly = async (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied:Admin only"
            })
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Only Admin Can Allow"
        })
    }
}

// Allow only normal users
export const userOnly = (req, res, next) => {
    if (req.user && req.user.role === "user") {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied: Users only" });
    }
};



