import { Request, Response } from "express";
import Post from "../models/postModel";
import { IUser } from "../models/userModel";

// Interface pour étendre Request avec l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

// logique d'analyse des posts
/**
 * Analyse le contenu d'un texte pour en extraire les éléments importants
 * @param text Le texte à analyser
 * @returns Un objet contenant les URLs, hashtags et mentions trouvés
 */
interface TextAnalysis {
  urls: string[];
  hashtags: string[];
  mentions: string[];
}

const analyzeText = (text: string): TextAnalysis => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /(?:^|\s)(#[a-zA-Z0-9_]+\b)/g;
  const mentionRegex = /(?:^|\s)(@[a-zA-Z0-9_]+\b)/g;
  
  const urls: string[] = [];
  const hashtags: string[] = [];
  const mentions: string[] = [];
  
  // Extraire les URLs
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    urls.push(urlMatch[1]);
  }
  
  // Extraire les hashtags
  let hashtagMatch;
  while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
    // Supprimer l'espace au début et enlever le #
    hashtags.push(hashtagMatch[1].trim().substring(1));
  }
  
  // Extraire les mentions
  let mentionMatch;
  while ((mentionMatch = mentionRegex.exec(text)) !== null) {
    // Supprimer l'espace au début et enlever le @
    mentions.push(mentionMatch[1].trim().substring(1));
  }
  
  return { urls, hashtags, mentions };
};

/**
 * Récupère les 5 derniers posts
 * @route GET /api/post/getpost
 * @access Private - Requiert authentification
 */
export const getRecentPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log(`📜 Récupération des posts récents`);
  try {
    // Récupérer les 5 derniers posts, triés par date de création (du plus récent au plus ancien)
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Tri décroissant par date
      .limit(5) // Limiter à 5 résultats
      .populate('author', 'username hashtag pdp') // Inclure les infos de l'auteur
      .select('-__v'); // Exclure le champ __v

    // Si aucun post n'est trouvé
    if (posts.length === 0) {
      console.log(`📭 Aucun post trouvé dans la base de données`);
      res.status(200).json({
        success: true,
        message: "Aucun post trouvé",
        data: []
      });
      return;
    }

    // Retourner les posts avec succès
    console.log(`✅ ${posts.length} posts récupérés avec succès`);
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
    
  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des posts: ${(error as Error).message}`);
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
  console.log(`📝 Tentative de création d'un nouveau post`);
  console.log(`⏱️ ${new Date().toISOString()}`);
  
  try {
    const { content, isThread = true } = req.body;

    // console.log (req.body);

    // Vérifier si l'utilisateur est connecté
    if (!req.user) {
      console.log(`🔒 Accès refusé: utilisateur non connecté`);
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }
    
    console.log(`👤 Utilisateur identifié: ${req.user.username || req.user.email} (ID: ${req.user._id})`);

    // Vérifier si le texte est fourni
    if (!content) {
      console.log(`❌ Tentative de création d'un post sans texte`);
      res.status(400).json({
        success: false,
        message: "Le texte du post est requis"
      });
      return;
    }
    
    console.log(`📋 Contenu du post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);

    // Analyse complète du texte pour extraire URLs, hashtags et mentions
    console.log(`🔍 Analyse du contenu du post...`);
    const { urls, hashtags, mentions } = analyzeText(content);
    
    // Logging des résultats de l'analyse
    if (urls.length > 0) {
      console.log(`🔗 URLs détectées: ${urls.join(', ')}`);
    } else {
      console.log(`🔗 Aucune URL détectée dans le texte`);
    }
    
    if (hashtags.length > 0) {
      console.log(`🏷️ Hashtags trouvés dans le texte: #${hashtags.join(', #')}`);
    } else {
      console.log(`🏷️ Aucun hashtag trouvé dans le texte`);
    }
    
    if (mentions.length > 0) {
      console.log(`👥 Mentions trouvées dans le texte: @${mentions.join(', @')}`);
    } else {
      console.log(`👥 Aucune mention trouvée dans le texte`);
    }

    // Détection automatique du premier média (URL d'image ou vidéo)
    let detectedMedia = undefined;
    
    if (urls.length > 0) {
      // Regex pour identifier si une URL pointe vers une image ou une vidéo
      const imageRegex = /\.(jpeg|jpg|gif|png|webp)(?:\?.*)?$/i;
      const videoRegex = /\.(mp4|webm|ogg|mov)(?:\?.*)?$/i;
      
      for (const url of urls) {
        if (imageRegex.test(url)) {
          console.log(`🖼️ URL d'image détectée: ${url}`);
          detectedMedia = { type: 'image', url };
          break;
        } else if (videoRegex.test(url)) {
          console.log(`🎥 URL de vidéo détectée: ${url}`);
          detectedMedia = { type: 'video', url };
          break;
        }
      }
    }
    
    // Comme le client n'envoie pas de média séparé, on utilise uniquement celui détecté dans le texte
    const postMedia = detectedMedia;
    
    if (postMedia) {
      console.log(`📎 Média attaché au post: ${postMedia.type} - ${postMedia.url}`);
    } else {
      console.log(`📎 Aucun média attaché au post`);
    }

    // Utiliser uniquement les hashtags extraits du texte
    console.log(`🔖 Tags du post: ${hashtags.length > 0 ? hashtags.join(', ') : 'aucun'}`);

    // Créer le nouveau post
    console.log(`💾 Enregistrement du post en base de données...`);
    const post = await Post.create({
      author: req.user._id,
      texte: content,
      media: postMedia,
      tags: hashtags,  // Uniquement les hashtags extraits du texte
      mentions: mentions, // Conserver les mentions pour référence future
      isThread: isThread || false
    });

    // Retourner le post créé
    console.log(`✅ Post créé avec succès! ID: ${post._id}`);
    res.status(201).json({
      success: true,
      message: "Post créé avec succès",
      data: post
    });
    
  } catch (error) {
    console.error(`💥 Erreur lors de la création du post: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du post",
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};

/**
 * Récupère les posts d'un utilisateur spécifique
 * @route GET /api/post/user/:userId
 * @access Private - Requiert authentification
 */
export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  console.log(`👤 Récupération des posts de l'utilisateur ID: ${userId}`);
  
  try {
    // Récupérer les posts de l'utilisateur spécifié
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username hashtag pdp')
      .select('-__v');

    console.log(`📊 ${posts.length} posts trouvés pour l'utilisateur ID: ${userId}`);
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
    
  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des posts de l'utilisateur: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des posts",
      error: (error as Error).message
    });
  }
};

/**
 * Récupère les posts de l'utilisateur connecté
 * @route GET /api/post/myposts
 * @access Private - Requiert authentification
 */
export const getMyPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Vérifier si l'utilisateur est connecté - le middleware devrait déjà avoir vérifié,
    // mais c'est une bonne pratique de double-vérifier
    if (!req.user) {
      console.log(`🔒 Accès refusé: utilisateur non authentifié`);
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    const userId = req.user._id;
    console.log(`👤 Récupération des posts de l'utilisateur connecté (ID: ${userId})`);

    // Récupérer les posts de l'utilisateur connecté
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'author',
        select: 'username hashtag pdp'
      })
      .select('_id texte createdAt media tags mentions');
    
    // Logging du résultat
    if (posts.length === 0) {
      console.log(`📭 Aucun post trouvé pour l'utilisateur ${req.user.username}`);
      res.status(200).json({
        success: true,
        message: "Vous n'avez pas encore publié de posts",
        data: []
      });
      return;
    }

    console.log(`📊 ${posts.length} posts récupérés pour l'utilisateur ${req.user.username}`);
    
    // Retourner les posts avec succès
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts.map(post => ({
        id: post._id,
        texte: post.texte,
        author: post.author,
        createdAt: post.createdAt,
        media: post.media,
        tags: post.tags
      }))
    });
    
  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des posts: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des posts",
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};

/**
 * Récupère les posts avec un tag spécifique
 * @route GET /api/post/tag/:tag
 * @access Private - Requiert authentification
 */
export const getPostsByTag = async (req: AuthRequest, res: Response): Promise<void> => {
  const { tag } = req.params;
  console.log(`🔎 Recherche de posts avec le tag: #${tag}`);
  
  try {
    // Récupérer les posts avec le tag spécifié
    const posts = await Post.find({ tags: tag })
      .sort({ createdAt: -1 })
      .populate('author', 'username hashtag pdp')
      .select('-__v');

    console.log(`🏷️ ${posts.length} posts trouvés avec le tag #${tag}`);
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
    
  } catch (error) {
    console.error(`💥 Erreur lors de la récupération des posts par tag: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des posts",
      error: (error as Error).message
    });
  }
};