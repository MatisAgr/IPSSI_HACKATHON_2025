import express from "express";
import authRoutes from "./authRoutes";

const router = express.Router();

// Définir la route /api/auth
router.use("/auth", authRoutes);

export default router;