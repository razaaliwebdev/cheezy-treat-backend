import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { cancelOrder, createOrder, deleteOrder, getAllOrder, getMyOrder, getSingleOrder, updateOrder } from '../controllers/orderController.js';




const router = express.Router();

// Create Order
router.post("/", protect, createOrder);

// Get All Order
router.get("/", protect, adminOnly, getAllOrder);

// Get My Order
router.get("/my", protect, getMyOrder);

// Cancel Order
router.delete("/cancelOrder", protect, cancelOrder);

// Get Single Order
router.get("/:id", protect, getSingleOrder)

// Update Order
router.put("/:id", protect, adminOnly, updateOrder)

// Delete Order
router.delete("/:id", protect, adminOnly, deleteOrder);



export default router;