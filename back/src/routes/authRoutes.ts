import express from "express";
import { register, login, checkEmail } from "../controllers/authController";


const router = express.Router();

// Routes d'authentification
router.post("/register", register);
router.post("/login" , login);
router.post("checkmail", checkEmail);



export default router;