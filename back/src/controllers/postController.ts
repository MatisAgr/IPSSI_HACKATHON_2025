import { Request, Response } from "express";
import Post from "../models/postModel";
import { IUser } from "../models/userModel";

// Interface pour étendre Request avec l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Récupère les 5 derniers posts
 * @route GET /api/post/getpost
 * @access Private - Requiert authentification
 */
export const getRecentPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Récupérer les 5 derniers posts, triés par date de création (du plus récent au plus ancien)
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Tri décroissant par date
      .limit(5) // Limiter à 5 résultats
      .populate('author', 'username hashtag pdp') // Inclure les infos de l'auteur
      .select('-__v'); // Exclure le champ __v

    // Si aucun post n'est trouvé
    if (posts.length === 0) {
      res.status(200).json({
        success: true,
        message: "Aucun post trouvé",
        data: []
      });
      return;
    }

    // Retourner les posts avec succès
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des posts:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des posts",
      error: (error as Error).message
    });
  }
};

/**
 * Crée un nouveau post avec extraction automatique des hashtags
 * @route POST /api/post
 * @access Private - Requiert authentification
 */
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { texte, media, isThread = true } = req.body;
      let { tags } = req.body;
  
      // Vérifier si l'utilisateur est connecté
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Non autorisé, veuillez vous connecter"
        });
        return;
      }
  
      // Vérifier si le texte est fourni
      if (!texte) {
        res.status(400).json({
          success: false,
          message: "Le texte du post est requis"
        });
        return;
      }
  
      // Extraire les hashtags du texte
      const hashtagRegex = /#(\w+)/g;
      const extractedTags: string[] = [];
      let match;
      
      while ((match = hashtagRegex.exec(texte)) !== null) {
        extractedTags.push(match[1]);
      }
  
      // Fusionner les tags extraits avec ceux fournis manuellement (s'il y en a)
      const allTags = [...new Set([...(tags || []), ...extractedTags])];
  
      // Créer le nouveau post
      const post = await Post.create({
        author: req.user._id,
        texte,
        media: media || undefined,
        tags: allTags,
        isThread: isThread || false
      });
  
      // Retourner le post créé
      res.status(201).json({
        success: true,
        message: "Post créé avec succès",
        data: post
      });
      
    } catch (error) {
      console.error("Erreur lors de la création du post:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la création du post",
        error: (error as Error).message
      });
    }
  };

/**
 * Récupère les posts d'un utilisateur spécifique
 * @route GET /api/post/user/:userId
 * @access Private - Requiert authentification
 */
export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Récupérer les posts de l'utilisateur spécifié
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username hashtag pdp')
      .select('-__v');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des posts de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des posts",
      error: (error as Error).message
    });
  }
};

/**
 * Récupère les posts avec un tag spécifique
 * @route GET /api/post/tag/:tag
 * @access Private - Requiert authentification
 */
export const getPostsByTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tag } = req.params;

    // Récupérer les posts avec le tag spécifié
    const posts = await Post.find({ tags: tag })
      .sort({ createdAt: -1 })
      .populate('author', 'username hashtag pdp')
      .select('-__v');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des posts par tag:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des posts",
      error: (error as Error).message
    });
  }
};