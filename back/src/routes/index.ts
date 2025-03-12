import express from "express";
import authRoutes from "./authRoutes";
import postRoutes from "./postRoutes";
import userRoutes from "./userRoutes";
import notificationRoutes from "./notificationRoutes";

const router = express.Router();

// Définir la route /api/auth
router.use("/auth", authRoutes);
router.use("/post", postRoutes);
router.use("/user", userRoutes);
router.use("/notifications", notificationRoutes);
export default router;