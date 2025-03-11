// src/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/userModel";
import { generateToken } from "../middleware/authMiddleware";

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      username, 
      email, 
      password, 
      hashtag,
      bio,
      age,
      sexe,
      interests
    } = req.body;

    // Check if user already exists with email, username or hashtag
    const userExists = await User.findOne({ 
      $or: [{ hashtag }, { email }] 
    });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: "User already exists with that email, username or hashtag"
      });
      return;
    }

    // Create new user (password hashing is handled in the model's pre-save hook)
    const user = await User.create({
      username,
      hashtag,
      bio: bio || "", // Default to empty string if bio is not provided
      email,
      premium: false, // Default value for new users
      password, 
      age: age || 0,
      sexe,
      interests: interests || []
    });

    // Generate token for the new user
    const token = generateToken(user.id);

    // Return success response with token
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: {
        id: user._id,
        username: user.username,
        hashtag: user.hashtag,
        email: user.email,
        premium: user.premium,
        bio: user.bio,
        age: user.age,
        sexe: user.sexe,
        interests: user.interests,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: (error as Error).message
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
      return;
    }

    // Generate token for the user
    const token = generateToken(user.id);

    // Return success response with token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        username: user.username,
        hashtag: user.hashtag,
        email: user.email,
        premium: user.premium,
        bio: user.bio,
        pdp: user.pdp,
        pdb: user.pdb,
        age: user.age,
        sexe: user.sexe,
        interests: user.interests
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: (error as Error).message
    });
  }
};