import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import Follow from '../models/followModel';
import mongoose from 'mongoose';
import { sendNotification } from '../services/notificationService';

// Interface pour étendre Request avec l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Follow a user
 * @route POST /api/follow
 * @desc Follow a user
 * @access Private
 */
export const followUser = async (req: Request, res: Response) => {
  try {
    const { followerId, followingId } = req.body;

    // Vérifier que les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
      res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
      return;
    }

    // Vérifier que les utilisateurs existent
    const follower = await User.findById(followerId);
    const following = await User.findById(followingId);

    if (!follower || !following) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Vérifier que l'utilisateur ne tente pas de se suivre lui-même
    if (followerId === followingId) {
      res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous suivre vous-même' });
      return;
    }

    // Vérifier si la relation de suivi existe déjà
    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (existingFollow) {
      res.status(400).json({ success: false, message: 'Vous suivez déjà cet utilisateur' });
      return;
    }

    // Créer la nouvelle relation de suivi
    const newFollow = new Follow({
      follower: followerId,
      following: followingId
    });

    await newFollow.save();

    // Envoyer une notification à l'utilisateur qui est suivi
    await sendNotification(
      followingId,  // Destinataire de la notification
      'follow',     // Type de notification
      undefined,    // Pas de postId pour un follow
      followerId    // L'utilisateur qui a effectué l'action
    );

    res.status(201).json({ 
      success: true, 
      message: 'Utilisateur suivi avec succès',
      data: newFollow
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    
    if ((error as any) instanceof mongoose.mongo.MongoServerError && (error as any).code === 11000) {
      res.status(400).json({ success: false, message: 'Vous suivez déjà cet utilisateur' });
      return;
    }
    
    console.error('Erreur lors du follow:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
/**
 * Unfollow a user
 * @route DELETE /api/follow/:id
 * @desc Unfollow a user
 * @access Private
 */
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { followerId, followingId } = req.body;

    // Vérifier que les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
      res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
      return;
    }

    // Vérifier que l'utilisateur ne tente pas de se unfollow lui-même
    if (followerId === followingId) {
      res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous unfollow vous-même' });
      return;
    }

    // Vérifier si la relation de suivi existe
    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (!existingFollow) {
      res.status(404).json({ success: false, message: 'Vous ne suivez pas cet utilisateur' });
      return;
    }

    // Supprimer la relation de suivi
    await Follow.findOneAndDelete({ follower: followerId, following: followingId });

    res.status(200).json({ 
      success: true, 
      message: 'Utilisateur unfollow avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du unfollow:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Get user followers
 * @route GET /api/followers/:userId
 * @desc Get all followers of a user
 * @access Public
 */
export const getUserFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
      return;
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Récupérer tous les follows où l'utilisateur est suivi
    const follows = await Follow.find({ following: userId })
      .populate('follower', 'username hashtag bio pdp premium');

    const followers = follows.map(follow => follow.follower);

    res.status(200).json({ 
      success: true, 
      count: followers.length,
      data: followers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des followers:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Get user following
 * @route GET /api/following/:userId
 * @desc Get all users that a user follows
 * @access Public
 */
export const getUserFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
      return;
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Récupérer tous les follows où l'utilisateur suit d'autres personnes
    const follows = await Follow.find({ follower: userId })
      .populate('following', 'username hashtag bio pdp premium');

    const following = follows.map(follow => follow.following);

    res.status(200).json({ 
      success: true, 
      count: following.length,
      data: following
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des following:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Check if user follows another user
 * @route GET /api/follow/check
 * @desc Check if a user follows another user
 * @access Public
 */
export const checkFollowStatus = async (req: Request, res: Response) => {
  try {
    const { followerId, followingId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(followerId as string) || 
        !mongoose.Types.ObjectId.isValid(followingId as string)) {
      res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
      return;
    }

    const followExists = await Follow.exists({ 
      follower: followerId, 
      following: followingId 
    });

    res.status(200).json({ 
      success: true, 
      isFollowing: !!followExists
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de follow:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Get follow count
 * @route GET /api/follow/count/:userId
 * @desc Get follower and following count for a user
 * @access Public
 */
export const getFollowCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
      return;
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Compter les followers
    const followersCount = await Follow.countDocuments({ following: userId });
    
    // Compter les following
    const followingCount = await Follow.countDocuments({ follower: userId });

    res.status(200).json({ 
      success: true, 
      data: {
        followers: followersCount,
        following: followingCount
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des compteurs de follow:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Get current user's follow count
 * @route GET /api/follow/me/count
 * @desc Get follower and following count for the authenticated user
 * @access Private
 */
export const getMyFollowCount = async (req: AuthRequest, res: Response) => {
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
    console.log(`👤 Récupération des compteurs de follow pour l'utilisateur connecté (ID: ${userId})`);

    // Compter les followers (abonnés)
    const followersCount = await Follow.countDocuments({ following: userId });
    
    // Compter les following (abonnements)
    const followingCount = await Follow.countDocuments({ follower: userId });

    console.log(`✅ Compteurs récupérés pour l'utilisateur ${req.user.username}: ${followersCount} followers, ${followingCount} following`);

    res.status(200).json({ 
      success: true, 
      data: {
        followers: followersCount,
        following: followingCount
      }
    });
  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des compteurs de follow: ${(error as Error).message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des compteurs de follow',
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};

export const getMyFollowers = async (req: AuthRequest, res: Response) => {
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
    console.log(`👤 Récupération des followers pour l'utilisateur connecté (ID: ${userId})`);

    // Récupérer tous les follows où l'utilisateur est suivi
    const follows = await Follow.find({ following: userId })
      .populate('follower', 'username hashtag bio pdp premium');

    const followers = follows.map(follow => follow.follower);

    console.log(`✅ Followers récupérés pour l'utilisateur ${req.user.username}: ${followers.length}`);

    res.status(200).json({ 
      success: true, 
      count: followers.length,
      data: followers
    });
  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des followers: ${(error as Error).message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des followers',
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};

export const getMyFollowing = async (req: AuthRequest, res: Response) => {
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
    console.log(`👤 Récupération des following pour l'utilisateur connecté (ID: ${userId})`);

    // Récupérer tous les follows où l'utilisateur suit d'autres personnes
    const follows = await Follow.find({ follower: userId })
      .populate('following', 'username hashtag bio pdp premium');

    const following = follows.map(follow => follow.following);

    console.log(`✅ Following récupérés pour l'utilisateur ${req.user.username}: ${following.length}`);

    res.status(200).json({ 
      success: true, 
      count: following.length,
      data: following
    });
  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des following: ${(error as Error).message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des following',
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};