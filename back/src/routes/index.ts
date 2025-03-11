import express from "express";
import authRoutes from "./authRoutes";
import postRoutes from "./postRoutes";

const router = express.Router();

// Définir la route /api/auth
router.use("/auth", authRoutes);
router.use("/post", postRoutes);
export default router;