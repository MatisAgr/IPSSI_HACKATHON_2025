import express from 'express';
import { 
  getTrendingPosts, 
  getTrendingHashtags,
  getTodayTrendingHashtags 
} from '../controllers/trendingController';

const router = express.Router();

// Route pour récupérer les posts les plus populaires
router.get('/', getTrendingPosts);

// Route pour récupérer les hashtags les plus populaires
router.get('/hashtags', getTrendingHashtags);          

// Route pour récupérer les hashtags les plus populaires du jour
router.get('/hashtags/today', getTodayTrendingHashtags); 

export default router;