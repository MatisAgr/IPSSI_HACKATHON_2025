import express from 'express';
import { getRetweets, toggleRetweet } from '../controllers/retweetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Route pour récupérer tous les retweets de l'utilisateur
router.get('/', protect, getRetweets);

// Route pour ajouter/supprimer un retweet
router.post('/:postId', protect, toggleRetweet);

export default router;