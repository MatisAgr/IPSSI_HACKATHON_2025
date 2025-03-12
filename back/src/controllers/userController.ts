import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";

// Interface pour étendre Request avec l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Récupère les informations du profil de l'utilisateur connecté
 * @route GET /api/user/me
 * @access Private - Requiert authentification
 */
export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!req.user) {
      console.log(`🔒 Accès refusé: utilisateur non authentifié`);
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    const userId = req.user._id;
    console.log(`👤 Récupération du profil utilisateur (ID: ${userId})`);

    // Rechercher l'utilisateur avec ses informations mises à jour
    const user = await User.findById(userId).select('-password -__v');

    if (!user) {
      console.log(`❌ Utilisateur non trouvé en base de données (ID: ${userId})`);
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }

    console.log(`✅ Profil récupéré avec succès pour ${user.username}`);

    // Retourner les informations utilisateur
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        hashtag: user.hashtag,
        bio: user.bio || "",
        email: user.email,
        premium: user.premium,
        pdp: user.pdp || "",
        pdb: user.pdb || "",
        age: user.age,
        sexe: user.sexe || "",
        interests: user.interests || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error(`💥 Erreur lors de la récupération du profil: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du profil",
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};

/**
 * Récupère le profil d'un utilisateur par son ID
 * @route GET /api/user/:userId
 * @access Private - Requiert authentification
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Recherche de l'utilisateur avec ID: ${userId}`);

    // Rechercher l'utilisateur par ID
    const user = await User.findById(userId).select('-password -__v');

    if (!user) {
      console.log(`❌ Utilisateur non trouvé (ID: ${userId})`);
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.username}`);

    // Retourner les informations utilisateur (sans données sensibles)
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        hashtag: user.hashtag,
        bio: user.bio || "",
        pdp: user.pdp || "",
        pdb: user.pdb || "",
        premium: user.premium,
        age: user.age,
        interests: user.interests || [],
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error(`💥 Erreur lors de la récupération de l'utilisateur: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'utilisateur",
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};

/**
 * Recherche un utilisateur par son hashtag ou son nom d'utilisateur
 * @route GET /api/user/search
 * @access Private - Requiert authentification
 */
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        message: "Veuillez fournir un terme de recherche valide"
      });
      return;
    }
    
    console.log(`🔎 Recherche d'utilisateurs avec le terme: ${query}`);
    
    // Recherche par hashtag ou username (insensible à la casse)
    const users = await User.find({
      $or: [
        { hashtag: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id username hashtag pdp bio premium')
    .limit(10);
    
    console.log(`✅ ${users.length} utilisateurs trouvés pour la recherche "${query}"`);
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
    
  } catch (error) {
    console.error(`💥 Erreur lors de la recherche d'utilisateurs: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la recherche d'utilisateurs",
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * @route PUT /api/user/me
 * @access Private - Requiert authentification
 */
export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!req.user) {
      console.log(`🔒 Accès refusé: utilisateur non authentifié`);
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    const userId = req.user._id;
    console.log(`✏️ Mise à jour du profil utilisateur (ID: ${userId})`);

    const { 
      bio,
      pdp,
      pdb,
      interests
    } = req.body;

    // Préparer les champs à mettre à jour
    const updateFields: Record<string, any> = {};
    
    if (bio !== undefined) updateFields.bio = bio;
    if (pdp !== undefined) updateFields.pdp = pdp;
    if (pdb !== undefined) updateFields.pdb = pdb;
    if (interests !== undefined) updateFields.interests = interests;

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true } // Retourner l'utilisateur mis à jour
    ).select('-password -__v');

    if (!updatedUser) {
      console.log(`❌ Utilisateur non trouvé lors de la mise à jour (ID: ${userId})`);
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }

    console.log(`✅ Profil mis à jour avec succès pour ${updatedUser.username}`);

    // Retourner les informations utilisateur mises à jour
    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        hashtag: updatedUser.hashtag,
        bio: updatedUser.bio || "",
        email: updatedUser.email,
        premium: updatedUser.premium,
        pdp: updatedUser.pdp || "",
        pdb: updatedUser.pdb || "",
        age: updatedUser.age,
        sexe: updatedUser.sexe || "",
        interests: updatedUser.interests || [],
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error(`💥 Erreur lors de la mise à jour du profil: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du profil",
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};