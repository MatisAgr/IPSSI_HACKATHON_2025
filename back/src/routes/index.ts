import express from "express";
import authRoutes from "./authRoutes";
import postRoutes from "./postRoutes";

import signetRoutes from "./signetRoutes";
import likeRoutes from './likeRoutes';
import retweetRoutes from './retweetRoutes';
import reponseRoutes from './reponseRoutes';
import searchRoutes from './searchRoutes';
import userRoutes from "./userRoutes";
import notificationRoutes from "./notificationRoutes";


const router = express.Router();

// Définir la route /api/auth
router.use("/auth", authRoutes);
router.use("/post", postRoutes);
router.use("/signet", signetRoutes);
router.use("/like", likeRoutes);
router.use("/retweet", retweetRoutes);
router.use("/reponse", reponseRoutes);
router.use("/search", searchRoutes);
router.use("/user", userRoutes);
router.use("/notifications", notificationRoutes);

export default router;