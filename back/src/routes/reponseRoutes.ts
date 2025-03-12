import express from 'express';
import { createReponse, getPostReplies, getPostReplyCount, getReplyCount, getThreadedReplies 
} from '../controllers/reponseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Créer une réponse à un post ou à une autre réponse
router.post('/:id', protect, createReponse);

// Récupérer toutes les réponses d'un post de manière hiérarchique
router.get('/post/:postId', protect, getPostReplies);

// Récupérer les réponses à une réponse spécifique
router.get('/thread/:reponseId', protect, getThreadedReplies);

// Routes de comptage
router.get('/count/post/:postId', getPostReplyCount);
router.get('/count/reply/:replyId', getReplyCount);

export default router;