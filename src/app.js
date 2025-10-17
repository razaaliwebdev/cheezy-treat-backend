import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "../src/routes/authRoutes.js";
import userRoutes from "../src/routes/userRoutes.js";
import productRoutes from "../src/routes/productRoutes.js";
import orderRoutes from "../src/routes/orderRoutes.js";
import couponRoutes from "../src/routes/couponRoutes.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Cheezy Treat 🍕 Server API is Working Fine ✅...</h1>");
});

export default app;
