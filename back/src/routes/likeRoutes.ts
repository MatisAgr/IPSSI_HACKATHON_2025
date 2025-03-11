import express from 'express';
import { getLikes, toggleLike } from '../controllers/likeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Route pour récupérer tous les likes de l'utilisateur
router.get('/', protect, getLikes);

// Route pour ajouter/supprimer un like
router.post('/:postId', protect, toggleLike);

export default router;