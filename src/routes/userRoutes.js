import express from "express";
import { editUserProfile, getAllUsers, userProfile } from "../controllers/userController.js";
import { adminOnly, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get All users    Admin
router.get("/admin/getAllUsers", protect, adminOnly, getAllUsers);



// Logged in user , Profile
router.get("/profile", protect, userProfile);

// Edit User Profile
router.post("/editUserProfile", protect, editUserProfile);




export default router;
