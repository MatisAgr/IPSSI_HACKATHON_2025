import { Request, Response } from "express";
import Post from "../models/postModel";
import Like from "../models/likeModel";
import { IUser } from "../models/userModel";
import { updatePopularityScore } from "./postController";
import { sendNotification } from "../services/notificationService";


interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Récupère tous les posts likés par l'utilisateur avec pagination
 * @route GET /api/like?page=1&limit=10
 * @access Private - Requiert authentification
 */
export const getLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    // Paramètres de pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Compter le nombre total de likes
    const total = await Like.countDocuments({ user_id: req.user._id });

    // Récupérer les likes avec pagination
    const likes = await Like.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'post_id',
        select: 'author texte isThread createdAt',
        populate: {
          path: 'author',
          select: 'username hashtag pdp'
        }
      });

    // Transformer les données pour ne renvoyer que les posts
    const formattedPosts = likes.map(like => {
      const post = like.post_id as any;
      return {
        author: post.author,
        texte: post.texte,
        isThread: post.isThread,
        createdAt: post.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des likes:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des likes",
      error: (error as Error).message
    });
  }
};

/**
 * Ajoute ou supprime un like sur un post
 * @route POST /api/like/:postId
 * @access Private - Requiert authentification
 */
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    const postId = req.params.postId;

    // Vérifier si le post existe
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post non trouvé"
      });
      return;
    }

    // Vérifier si le like existe déjà
    const existingLike = await Like.findOne({
      user_id: req.user._id,
      post_id: postId
    });

    if (!existingLike) {
      // Créer un nouveau like
      await Like.create({
        user_id: req.user._id,
        post_id: postId
      });

      // Mettre à jour le score après l'ajout du like
      await updatePopularityScore(postId);

      // Mettre à jour le compteur de likes du post
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

      // Récupérer l'id de l'auteur du post
      const postAuthorId = typeof post.author === 'object' ? post.author.toString() : post.author;

      // Envoyer une notification au post auteur
      await sendNotification(
        postAuthorId, // Destinataire de la notification
        'like',     // Type de notification pour un like
        postId,    // Id du post liké
        String(req.user._id)  // L'utilisateur qui a effectué le like
      );

      res.status(201).json({
        success: true,
        message: "Post liké",
        isLiked: true
      });
    } else {
      // Supprimer le like existant
      await Like.findByIdAndDelete(existingLike._id);

      // Mettre à jour le score après le retrait du like
      await updatePopularityScore(postId);

      // Décrémenter le compteur de likes du post
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

      res.status(200).json({
        success: true,
        message: "Like retiré",
        isLiked: false
      });
    }

  } catch (error) {
    console.error("Erreur lors de la modification du like:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la modification du like",
      error: (error as Error).message
    });
  }
};

/**
 * Compte le nombre de likes pour un post
 * @route GET /api/like/count/:postId
 * @access Public
 */
export const getLikeCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    // Vérifier si le post existe
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post non trouvé"
      });
      return;
    }

    const count = await Like.countDocuments({ post_id: postId });

    res.status(200).json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error("Erreur lors du comptage des likes:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du comptage des likes",
      error: (error as Error).message
    });
  }
};