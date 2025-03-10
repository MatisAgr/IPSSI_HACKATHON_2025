// src/routes/index.ts
import express from "express";
import authRoutes from "./authRoutes";

const router = express.Router();

// Apply routes
router.use("/auth", authRoutes);

export default router; 