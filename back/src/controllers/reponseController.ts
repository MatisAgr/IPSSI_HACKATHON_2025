import { Request, Response } from "express";
import Reponse from "../models/reponseModel";
import Post from "../models/postModel";
import { IUser } from "../models/userModel";
import { updatePopularityScore } from "./postController";

interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Crée une nouvelle réponse (à un post ou à une réponse)
 * @route POST /api/reponse/:id
 * @access Private - Requiert authentification
 */
export const createReponse = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log(`📝 Tentative de création d'une nouvelle réponse`);
  
  try {
    const { texte, media } = req.body;
    const { id } = req.params; 
    
    if (!req.user) {
      console.log(`🔒 Accès refusé: utilisateur non connecté`);
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    // Vérifier d'abord si c'est un post
    let post = await Post.findById(id);
    let postId = id;
    let parentReplyId = null;

    // Si ce n'est pas un post, vérifier si c'est une réponse
    if (!post) {
      const parentReponse = await Reponse.findById(id);
      if (!parentReponse) {
        console.log(`❌ Ni post ni réponse trouvé avec l'ID: ${id}`);
        res.status(404).json({
          success: false,
          message: "Post ou réponse non trouvé"
        });
        return;
      }

      // C'est une réponse, on récupère le post_id associé
      postId = parentReponse.post_id.toString();
      parentReplyId = id;

      // Vérifier que le post existe toujours
      post = await Post.findById(postId);
      if (!post) {
        console.log(`❌ Post parent non trouvé avec l'ID: ${postId}`);
        res.status(404).json({
          success: false,
          message: "Post parent non trouvé"
        });
        return;
      }
    }

    if (!texte) {
      console.log(`❌ Tentative de création d'une réponse sans texte`);
      res.status(400).json({
        success: false,
        message: "Le texte de la réponse est requis"
      });
      return;
    }

    // Créer la nouvelle réponse
    console.log(`💾 Enregistrement de la réponse en base de données...`);
    const reponse = await Reponse.create({
      post_id: postId,
      user_id: req.user._id,
      parent_reply_id: parentReplyId,
      texte,
      media
    });

    await updatePopularityScore(postId);

    // Populer la réponse avec les informations nécessaires
    await reponse.populate([
      {
        path: 'user_id',
        select: 'username hashtag pdp'
      },
      {
        path: 'parent_reply_id',
        select: 'texte user_id',
        populate: {
          path: 'user_id',
          select: 'username hashtag'
        }
      }
    ]);

    // Incrémenter le compteur de réponses du post
    await Post.findByIdAndUpdate(postId, { $inc: { replyCount: 1 } });

    console.log(`✅ Réponse créée avec succès! ID: ${reponse._id}`);
    res.status(201).json({
      success: true,
      message: "Réponse créée avec succès",
      data: reponse
    });

  } catch (error) {
    console.error(`💥 Erreur lors de la création de la réponse: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la réponse",
      error: (error as Error).message
    });
  }
};

/**
 * Récupère les réponses d'un post avec pagination
 * @route GET /api/reponse/:postId
 * @access Private - Requiert authentification
 */
export const getPostReplies = async (req: AuthRequest, res: Response): Promise<void> => {
  const { postId } = req.params;
  console.log(`🔍 Récupération des réponses du post ID: ${postId}`);

  try {
    // Paramètres de pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reponses = await Reponse.find({ post_id: postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'username hashtag pdp');

    res.status(200).json({
      success: true,
      data: reponses
    });

  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des réponses: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des réponses",
      error: (error as Error).message
    });
  }
};

/**
 * Compte le nombre total de réponses à un post (incluant les réponses imbriquées)
 * @route GET /api/reponse/count/post/:postId
 * @access Public
 */
export const getPostReplyCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const count = await Reponse.countDocuments({ post_id: postId });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error(`💥 Erreur lors du comptage des réponses: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du comptage des réponses",
      error: (error as Error).message
    });
  }
};

/**
 * Compte le nombre de réponses à une réponse spécifique
 * @route GET /api/reponse/count/reply/:replyId
 * @access Public
 */
export const getReplyCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { replyId } = req.params;
    const count = await Reponse.countDocuments({ parent_reply_id: replyId });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error(`💥 Erreur lors du comptage des réponses: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du comptage des réponses",
      error: (error as Error).message
    });
  }
};

/**
 * Récupère les réponses imbriquées (réponses à une réponse)
 * @route GET /api/reponse/thread/:reponseId
 * @access Private - Requiert authentification
 */
export const getThreadedReplies = async (req: AuthRequest, res: Response): Promise<void> => {
  const { reponseId } = req.params;
  console.log(`🔍 Récupération des réponses imbriquées pour la réponse ID: ${reponseId}`);

  try {
    const reponses = await Reponse.find({ parent_reply_id: reponseId })
      .sort({ createdAt: -1 })
      .populate('user_id', 'username hashtag pdp');

    console.log(`📊 ${reponses.length} réponses imbriquées trouvées`);
    res.status(200).json({
      success: true,
      count: reponses.length,
      data: reponses
    });

  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des réponses imbriquées: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des réponses",
      error: (error as Error).message
    });
  }
};