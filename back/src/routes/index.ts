import express from "express";
import authRoutes from "./authRoutes";
import postRoutes from "./postRoutes";
import signetRoutes from "./signetRoutes";
import likeRoutes from './likeRoutes';
import retweetRoutes from './retweetRoutes';


const router = express.Router();

// Définir la route /api/auth
router.use("/auth", authRoutes);
router.use("/post", postRoutes);
router.use("/signet", signetRoutes);
router.use("/like", likeRoutes);
router.use("/retweet", retweetRoutes);

export default router;