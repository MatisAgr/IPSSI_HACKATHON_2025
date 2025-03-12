import express from 'express';
import { getLikes, toggleLike, getLikeCount } from '../controllers/likeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Route pour récupérer tous les likes de l'utilisateur
router.get('/', protect, getLikes);

// Route pour ajouter/supprimer un like
router.post('/:postId', protect, toggleLike);

// Route pour récupérer le nombre de likes d'un post
router.get('/count/:postId', getLikeCount);


export default router;