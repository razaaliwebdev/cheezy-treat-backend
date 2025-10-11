import express from "express";
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout,
} from "../controllers/authController.js";

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

export default router;
