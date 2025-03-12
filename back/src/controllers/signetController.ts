import { Request, Response } from "express";
import Post from "../models/postModel";
import Signet from "../models/signetModel";
import { IUser } from "../models/userModel";

interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Récupère tous les posts enregistrés comme signets par l'utilisateur avec pagination
 * @route GET /api/signet?page=1&limit=10
 * @access Private - Requiert authentification
 */
export const getSignets = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Compter le nombre total de signets
    const total = await Signet.countDocuments({ user_id: req.user._id });

    // Récupérer les signets avec pagination
    const signets = await Signet.find({ user_id: req.user._id })
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
    const formattedPosts = signets.map(signet => {
      const post = signet.post_id as any;
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
    console.error("Erreur lors de la récupération des signets:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des signets",
      error: (error as Error).message
    });
  }
};

/**
 * Ajoute ou supprime un post des signets
 * @route POST /api/signet/:postId
 * @access Private - Requiert authentification
 */
export const toggleSignet = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Vérifier si le signet existe déjà
    const existingSignet = await Signet.findOne({
      user_id: req.user._id,
      post_id: postId
    });

    if (!existingSignet) {
      // Créer un nouveau signet
      await Signet.create({
        user_id: req.user._id,
        post_id: postId
      });

      res.status(201).json({
        success: true,
        message: "Post ajouté aux signets",
        isBookmarked: true
      });
    } else {
      // Supprimer le signet existant
      await Signet.findByIdAndDelete(existingSignet._id);

      res.status(200).json({
        success: true,
        message: "Post retiré des signets",
        isBookmarked: false
      });
    }

  } catch (error) {
    console.error("Erreur lors de la modification du signet:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la modification du signet",
      error: (error as Error).message
    });
  }
};

/**
 * Compte le nombre de signets pour un post
 * @route GET /api/signet/count/:postId
 * @access Public
 */
export const getSignetCount = async (req: Request, res: Response): Promise<void> => {
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

    const count = await Signet.countDocuments({ post_id: postId });

    res.status(200).json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error("Erreur lors du comptage des signets:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du comptage des signets",
      error: (error as Error).message
    });
  }
};