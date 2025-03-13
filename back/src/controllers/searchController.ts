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

    // Diviser la phrase en mots et filtrer les mots vides
    const keywords = keyword
      .split(' ')
      .filter(word => word.length > 1)
      .join(' ');

    if (!keywords) {
      res.status(400).json({
        success: false,
        message: "Veuillez fournir des mots-clés valides pour la recherche"
      });
      return;
    }

    // Utiliser la recherche full-text de MongoDB
    const searchQuery = {
      $text: {
        $search: keywords,
        $caseSensitive: false,
        $diacriticSensitive: false
      }
    };

    const total = await Post.countDocuments(searchQuery);

    if (total === 0) {
      res.status(404).json({
        success: false,
        message: `Aucun post trouvé contenant les mots "${keyword}"`
      });
      return;
    }

    // Récupérer les posts avec leur score de pertinence
    const posts = await Post.find(searchQuery, {
      score: { $meta: 'textScore' } 
    })
    .sort({
      score: { $meta: 'textScore' }, 
      createdAt: -1 
    })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username hashtag pdp');

    // Formatter les résultats avec les scores
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      author: post.author,
      texte: post.texte,
      isThread: post.isThread,
      createdAt: post.createdAt,
    }));

    console.log(`🔍 ${total} posts trouvés pour la recherche "${keyword}"`);
    res.status(200).json({
      success: true,
      data: {
        posts: formattedPosts,
        searchInfo: {
          originalQuery: keyword,
          processedKeywords: keywords
        },
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

/**
 * Recherche des posts triés par date
 * @route GET /api/search/posts/date?order=desc|asc
 * @access Public
 */
export const searchPostsByDateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order = 'desc' } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'asc' ? 1 : -1;
    const orderText = order === 'asc' ? 'ancien' : 'récent';

    const total = await Post.countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username hashtag pdp')
      .select('author texte isThread createdAt');

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      author: post.author,
      texte: post.texte,
      isThread: post.isThread,
      createdAt: post.createdAt
    }));

    console.log(`📅 ${total} posts triés du plus ${orderText} au moins ${orderText}`);
    res.status(200).json({
      success: true,
      data: {
        posts: formattedPosts,
        sortOrder: order,
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
    console.error("Erreur lors du tri des posts par date:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du tri",
      error: (error as Error).message
    });
  }
};

