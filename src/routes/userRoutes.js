import express from "express";
import { getAllUsers, updateUserProfile, userProfile } from "../controllers/userController.js";
import { adminOnly, protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js'

const router = express.Router();


// Get All users    Admin
router.get("/admin/getAllUsers", protect, adminOnly, getAllUsers);



// Logged in user , Profile
router.get("/profile/:id", protect, userProfile);

// Edit User Profile
router.put("/profile/:id", protect, upload.single("profileImage"), updateUserProfile);




export default router;
