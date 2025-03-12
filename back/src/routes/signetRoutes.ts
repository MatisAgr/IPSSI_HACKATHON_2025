import express from 'express';
import { getSignets, toggleSignet, getSignetCount} from '../controllers/signetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Route pour récupérer tous les signets de l'utilisateur
router.get('/', protect, getSignets);

// Route pour ajouter/supprimer un signet
router.post('/:postId', protect, toggleSignet);

// Route pour récupérer le nombre de signets d'un post
router.get('/count/:postId', getSignetCount);

export default router;