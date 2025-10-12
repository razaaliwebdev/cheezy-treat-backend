import jwt from 'jsonwebtoken'
import User from '../models/userModel.js';


// User Auth
export const protect = async (error, req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized , no token"
            })
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        }

        next();

    } catch (error) {
        console.log("Auth middelware error:", error)
        return res.status(401).json({
            success: false,
            message: "Not authorized."
        })
    }
}

// Allow Only Admin Users
export const adminOnly = async (error, req, res, next) => {
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

//  Allow only normal users
export const userOnly = (req, res, next) => {
    if (req.user && req.user.role === "user") {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied: Users only" });
    }
};