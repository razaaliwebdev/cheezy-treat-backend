import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { upload } from "../middlewares/uploadMiddleware.js"
import { createDeal, deleteDeal, getAllDeals, getSingleDeal, updateDeal } from '../controllers/DealController.js';


const router = express.Router();

// Create Deal
router.post("/", protect, adminOnly, upload.single("image"), createDeal);
// Update Deal
router.put("/:id", protect, adminOnly, upload.single("image"), updateDeal);
// Delete Deal
router.delete("/:id", protect, adminOnly, deleteDeal);

// Get All Deals
router.get("/", getAllDeals);
router.get("/:id", getSingleDeal)

export default router;