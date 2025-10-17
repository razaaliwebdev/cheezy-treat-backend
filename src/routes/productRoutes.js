import express from "express";
import { createProduct, deleteProduct, getAllProducts, getSingleProduct, updateProduct } from "../controllers/productController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();



// Get All Products
router.get("/", getAllProducts);

// Get Single Product
router.get("/:id", getSingleProduct)

// Create Product
router.post("/", protect, adminOnly, upload.array("images"), createProduct);


// Update Product
router.put("/:id", protect, adminOnly, upload.array("images"), updateProduct)

// Delete Product
router.delete("/:id", protect, adminOnly, deleteProduct);


export default router;
