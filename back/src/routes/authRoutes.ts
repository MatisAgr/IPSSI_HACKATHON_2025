import express from "express";
import { register, login } from "../controllers/authController";

const router = express.Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// You would add other auth routes here (logout, profile, etc.)

export default router;