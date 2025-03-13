import { Request, Response } from "express";
import Post from "../models/postModel";
import Like from "../models/likeModel";
import Retweet from "../models/retweetModel";
import Reponse from "../models/reponseModel";

/**
 * Récupère les posts les plus populaires avec pagination
 * @route GET /api/trending?page=1&limit=10
 * @access Public
 */
export const getTrendingPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Compter le total des posts
    const total = await Post.countDocuments();

    // Récupérer les posts triés par popularityScore
    const posts = await Post.find()
      .sort({ popularityScore: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username hashtag pdp')
      .select('author texte isThread createdAt popularityScore');

    console.log(`📊 Récupération des ${limit} posts les plus populaires (Page ${page})`);
    res.status(200).json({
      success: true,
      data: {
        posts: posts.map(post => ({
          post: {
            _id: post._id,
            author: post.author,
            texte: post.texte,
            isThread: post.isThread,
            createdAt: post.createdAt
          },
          popularityScore: post.popularityScore
        })),
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
    console.error("Erreur lors de la récupération des posts populaires:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des posts populaires",
      error: (error as Error).message
    });
  }
};

/**
 * Récupère les hashtags les plus populaires
 * @route GET /api/trending/hashtags?page=1&limit=10
 * @access Public
 */
export const getTrendingHashtags = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Récupérer tous les posts avec leurs tags
    const posts = await Post.find()
      .select('_id tags')
      .lean();

    // Créer un map pour stocker les informations de chaque hashtag
    const hashtagStats = new Map();

    // Pour chaque post, traiter ses hashtags
    for (const post of posts) {
      if (!post.tags) continue;

      // Compter les interactions pour ce post
      const [likes, retweets, replies] = await Promise.all([
        Like.countDocuments({ post_id: post._id }),
        Retweet.countDocuments({ post_id: post._id }),
        Reponse.countDocuments({ post_id: post._id })
      ]);

      const totalInteractions = likes + retweets + replies;

      // Mettre à jour les stats pour chaque hashtag du post
      for (const tag of post.tags) {
        if (!hashtagStats.has(tag)) {
          hashtagStats.set(tag, {
            tag,
            postCount: 0,
            totalInteractions: 0,
            score: 0
          });
        }

        const stats = hashtagStats.get(tag);
        stats.postCount += 1;
        stats.totalInteractions += totalInteractions;
        stats.score = stats.postCount + (stats.totalInteractions * 0.5);
      }
    }

    // Convertir la Map en tableau et trier par score
    const sortedHashtags = Array.from(hashtagStats.values())
      .sort((a, b) => b.score - a.score);

    // Appliquer la pagination
    const paginatedHashtags = sortedHashtags.slice(skip, skip + limit);
    const total = sortedHashtags.length;

    console.log(`🏷️ Récupération des ${limit} hashtags les plus populaires (Page ${page})`);
    res.status(200).json({
      success: true,
      data: {
        hashtags: paginatedHashtags.map(h => ({
          tag: h.tag,
          postCount: h.postCount,
          totalInteractions: h.totalInteractions,
          score: Math.round(h.score * 100) / 100 // Arrondir à 2 décimales
        })),
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
    console.error("Erreur lors de la récupération des hashtags populaires:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des hashtags populaires",
      error: (error as Error).message
    });
  }
};

/**
 * Récupère les hashtags tendances des dernières 24h
 * @route GET /api/trending/hashtags/today?page=1&limit=10
 * @access Public
 */
export const getTodayTrendingHashtags = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Calculer la date d'il y a 24h
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Récupérer uniquement les posts des dernières 24h
    const recentPosts = await Post.find({
      createdAt: { $gte: last24Hours }
    })
    .select('_id tags createdAt')
    .lean();

    if (recentPosts.length === 0) {
      console.log('📭 Aucun hashtag tendance trouvé dans les dernières 24h');
      res.status(200).json({
        success: true,
        data: {
          hashtags: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
            hasMore: false
          }
        }
      });
      return;
    }

    // Map pour stocker les stats des hashtags des dernières 24h
    const todayHashtagStats = new Map();

    // Analyser chaque post récent
    for (const post of recentPosts) {
      if (!post.tags) continue;

      // Récupérer les interactions récentes pour ce post
      const [likes, retweets, replies] = await Promise.all([
        Like.countDocuments({ 
          post_id: post._id,
          createdAt: { $gte: last24Hours }
        }),
        Retweet.countDocuments({ 
          post_id: post._id,
          createdAt: { $gte: last24Hours }
        }),
        Reponse.countDocuments({ 
          post_id: post._id,
          createdAt: { $gte: last24Hours }
        })
      ]);

      const todayInteractions = likes + retweets + replies;

      // Mettre à jour les stats pour chaque hashtag
      for (const tag of post.tags) {
        if (!todayHashtagStats.has(tag)) {
          todayHashtagStats.set(tag, {
            tag,
            postCount: 0,
            totalInteractions: 0,
            score: 0,
            lastUsed: post.createdAt
          });
        }

        const stats = todayHashtagStats.get(tag);
        stats.postCount += 1;
        stats.totalInteractions += todayInteractions;
        // TrendingScore = (Nombre de posts) + (Total interactions * 0.5)
        stats.score = stats.postCount + (stats.totalInteractions * 0.5);
        stats.lastUsed = new Date(Math.max(stats.lastUsed.getTime(), post.createdAt.getTime()));
      }
    }

    // Convertir en tableau et trier par score puis par date la plus récente
    const trendingHashtags = Array.from(todayHashtagStats.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      });

    // Appliquer la pagination
    const paginatedTrends = trendingHashtags.slice(skip, skip + limit);
    const total = trendingHashtags.length;

    console.log(`🔥 ${total} hashtags tendances trouvés sur les dernières 24h`);
    res.status(200).json({
      success: true,
      data: {
        hashtags: paginatedTrends.map(h => ({
          tag: h.tag,
          postCount: h.postCount,
          totalInteractions: h.totalInteractions,
          score: Math.round(h.score * 100) / 100,
          lastUsed: h.lastUsed
        })),
        timeRange: {
          from: last24Hours,
          to: new Date()
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
    console.error("Erreur lors de la récupération des hashtags tendances:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des hashtags tendances",
      error: (error as Error).message
    });
  }
};