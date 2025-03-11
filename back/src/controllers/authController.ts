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
      date,
      sexe, 
    } = req.body;

    // Check if user already exists with email, username or hashtag
    const userExists = await User.findOne({ 
      $or: [ { email }] 
    });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: "User already exists with that email, username or hashtag"
      });
      return;
    }

    const hashtag = await generateUniqueHashtag(username, User);
    const age = date ? calculateAge(date) : 0;

    // Create new user (password hashing is handled in the model's pre-save hook)
    const user = await User.create({
      username,
      hashtag, // generated from username
      email,
      premium: false, // Default value for new users
      password, 
      age,
      sexe,
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

/**
 * Vérifie si un email est déjà utilisé
 * @route POST /api/auth/checkmail
 * @access Public
 */
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Vérifier si l'email est fourni
    if (!email) {
      res.status(400).json({
        success: false,
        message: "L'email est requis"
      });
      return;
    }

    // Vérifier si l'email existe déjà dans la base de données
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Email déjà utilisé
      res.status(200).json({
        success: true,
        exists: true,
        message: "Cet email est déjà utilisé"
      });
    } else {
      // Email disponible
      res.status(200).json({
        success: true,
        exists: false,
        message: "Cet email est disponible"
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification d'email:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la vérification d'email",
      error: (error as Error).message
    });
  }
};

    /**
 * Calcule l'âge à partir d'une date de naissance
 * @param birthDate Date de naissance au format YYYY-MM-DD
 * @returns L'âge en années
 */
    function calculateAge(birthDate: string): number {
      const today = new Date();
      const birth = new Date(birthDate);
      
      // Vérifier si la date est valide
      if (isNaN(birth.getTime())) {
        return 0; // Retourner 0 en cas de date invalide
      }
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDifference = today.getMonth() - birth.getMonth();
      
      // Si le mois de naissance n'est pas encore passé cette année ou
      // si c'est le même mois mais que le jour n'est pas encore passé
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    }

/**
 * Génère un hashtag unique à partir du nom d'utilisateur
 * Vérifie si le hashtag existe déjà dans la base de données et ajoute un nombre aléatoire si nécessaire
 * 
 * @param username Le nom d'utilisateur à partir duquel générer le hashtag
 * @param User Le modèle Mongoose User pour vérifier l'unicité
 * @returns Un hashtag unique
 */
export const generateUniqueHashtag = async (username: string, User: any): Promise<string> => {
  // Générer un hashtag initial à partir du nom d'utilisateur
  let hashtag = `#${username.toLowerCase().replace(/ /g, "")}`;
  
  // Vérifier si ce hashtag existe déjà
  const existingUserWithHashtag = await User.findOne({ hashtag });
  
  // Si le hashtag existe, ajouter un nombre aléatoire
  if (existingUserWithHashtag) {
    const randomNum = Math.floor(Math.random() * 10000);
    hashtag = `#${username.toLowerCase().replace(/ /g, "")}${randomNum}`;
  }
  
  return hashtag;
};