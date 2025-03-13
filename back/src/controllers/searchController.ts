import { Request, Response } from "express";
import User from "../models/userModel";
import Post from "../models/postModel";


/**
 * Recherche un utilisateur par son hashtag exact
 * @route GET /api/search/user/:hashtag
 * @access Public
 */
export const searchUserByHashtag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hashtag } = req.params;
    const searchTerm = hashtag.startsWith('@') ? hashtag : `@${hashtag}`;

    // Recherche exacte du hashtag
    const users = await User.find({ 
      hashtag: searchTerm  // Recherche exacte, plus de regex
    })
    .select('username hashtag pdp pdb bio createdAt');

    console.log(`🔍 Recherche d'utilisateur avec le hashtag exact: ${searchTerm}`);
    
    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: `Aucun utilisateur trouvé avec le hashtag ${searchTerm}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `${users.length} utilisateur(s) trouvé(s) avec le hashtag ${searchTerm}`,
      data: users
    });

  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la recherche",
      error: (error as Error).message
    });
  }
};

/**
 * Recherche des posts par hashtag (insensible à la casse)
 * @route GET /api/search/posts/:tag
 * @access Public
 */
export const searchPostsByTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag } = req.params;
    const searchTerm = tag.startsWith('#') ? tag.substring(1) : tag;

    // Paramètres de pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const tagPattern = new RegExp(`^${searchTerm}$`, 'i');

    // Compter le total des résultats
    const total = await Post.countDocuments({ 
      tags: tagPattern
    });

    if (total === 0) {
      res.status(404).json({
        success: false,
        message: `Aucun post trouvé avec le hashtag #${searchTerm}`
      });
      return;
    }

    // Récupérer les posts avec seulement les champs nécessaires
    const posts = await Post.find({ 
      tags: tagPattern
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'author',
      select: 'username hashtag pdp'
    });

    // Transformer les données pour la réponse
    const formattedPosts = posts.map(post => ({
      author: post.author,
      texte: post.texte,
      isThread: post.isThread,
      createdAt: post.createdAt
    }));

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
    console.error("Erreur lors de la recherche de posts:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la recherche",
      error: (error as Error).message
    });
  }
};

/**
 * Recherche des posts par mots-clés dans le texte
 * @route GET /api/search/keyword/:keyword
 * @access Public
 */
export const searchPostsByKeyword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchPattern = new RegExp(keyword, 'i');

    const total = await Post.countDocuments({ 
      texte: searchPattern
    });

    if (total === 0) {
      res.status(404).json({
        success: false,
        message: `Aucun post trouvé contenant "${keyword}"`
      });
      return;
    }

    const posts = await Post.find({ texte: searchPattern })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username hashtag pdp');

    res.status(200).json({
      success: true,
      data: {
        posts,
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
    console.error("Erreur lors de la recherche par mot-clé:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la recherche",
      error: (error as Error).message
    });
  }
};

