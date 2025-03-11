import express from "express";
import { 
  getRecentPosts, 
  createPost, 
  getUserPosts, 
  getPostsByTag 
} from "../controllers/postController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Route pour récupérer les 5 derniers posts - protégée par authentification
router.get("/getpost", protect, getRecentPosts);

// Route pour créer un nouveau post - protégée par authentification
router.post("/", protect, createPost);

// Routes additionnelles
router.get("/user/:userId", protect, getUserPosts);
router.get("/tag/:tag", protect, getPostsByTag);

export default router;