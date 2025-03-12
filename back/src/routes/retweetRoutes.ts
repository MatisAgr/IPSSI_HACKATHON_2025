import express from 'express';
import { getRetweets, toggleRetweet, getRetweetCount } from '../controllers/retweetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Route pour récupérer tous les retweets de l'utilisateur
router.get('/', protect, getRetweets);

// Route pour ajouter/supprimer un retweet
router.post('/:postId', protect, toggleRetweet);

// Route pour récupérer le nombre de retweets d'un post
router.get('/count/:postId', getRetweetCount);

export default router;