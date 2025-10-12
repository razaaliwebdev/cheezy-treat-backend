import express from "express";
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout,
  getMe,
} from "../controllers/authController.js";
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Verify Otp
router.post("/verify-otp", verifyOtp);

// Reset Password
router.post("/reset-password", resetPassword);

// Logout
router.post("/logout", logout);


// Protected Route 
router.get("/me", protect, getMe);

export default router;
