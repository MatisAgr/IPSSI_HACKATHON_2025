import { Request, Response } from "express";
import Post from "../models/postModel";
import Retweet from "../models/retweetModel";
import { IUser } from "../models/userModel";
import { updatePopularityScore } from "./postController";

interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Récupère tous les retweets de l'utilisateur avec pagination
 * @route GET /api/retweet?page=1&limit=10
 * @access Private - Requiert authentification
 */
export const getRetweets = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Compter le nombre total de retweets
    const total = await Retweet.countDocuments({ user_id: req.user._id });

    // Récupérer les retweets avec pagination
    const retweets = await Retweet.find({ user_id: req.user._id })
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
    const formattedPosts = retweets.map(retweet => {
      const post = retweet.post_id as any;
      return {
        author: post.author,
        texte: post.texte,
        isThread: post.isThread,
        createdAt: post.createdAt
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
    console.error("Erreur lors de la récupération des retweets:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des retweets",
      error: (error as Error).message
    });
  }
};

/**
 * Ajoute ou supprime un retweet
 * @route POST /api/retweet/:postId
 * @access Private - Requiert authentification
 */
export const toggleRetweet = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Vérifier si le retweet existe déjà
    const existingRetweet = await Retweet.findOne({
      user_id: req.user._id,
      post_id: postId
    });

    if (!existingRetweet) {
      // Créer un nouveau retweet
      await Retweet.create({
        user_id: req.user._id,
        post_id: postId
      });
      
      await updatePopularityScore(postId);

      res.status(201).json({
        success: true,
        message: "Post retweeté",
        isRetweeted: true
      });
    } else {
      // Supprimer le retweet existant
      await Retweet.findByIdAndDelete(existingRetweet._id);
      
      await updatePopularityScore(postId);

      res.status(200).json({
        success: true,
        message: "Retweet supprimé",
        isRetweeted: false
      });
    }

  } catch (error) {
    console.error("Erreur lors de la modification du retweet:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la modification du retweet",
      error: (error as Error).message
    });
  }
};

/**
 * Compte le nombre de retweets pour un post
 * @route GET /api/retweet/count/:postId
 * @access Public
 */
export const getRetweetCount = async (req: Request, res: Response): Promise<void> => {
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

    const count = await Retweet.countDocuments({ post_id: postId });

    res.status(200).json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error("Erreur lors du comptage des retweets:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du comptage des retweets",
      error: (error as Error).message
    });
  }
};