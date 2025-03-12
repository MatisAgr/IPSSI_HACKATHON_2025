import express from 'express';
import { 
  getUnreadNotifications, 
  getAllNotifications, 
  markNotificationsAsRead 
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Routes pour les notifications
router.get('/unread', protect, getUnreadNotifications);
router.get('/', protect, getAllNotifications);
router.put('/read', protect, markNotificationsAsRead);

export default router;