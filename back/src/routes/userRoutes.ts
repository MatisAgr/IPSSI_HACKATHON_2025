import express from 'express';
import { 
  followUser, 
  unfollowUser, 
  getUserFollowers, 
  getUserFollowing,
  checkFollowStatus,
  getFollowCount
} from '../controllers/followController';

import { getMyProfile, getUserById, searchUsers, updateMyProfile } from '../controllers/userController';


import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Routes pour les fonctionnalités follow/unfollow
router.post('/follow', protect ,followUser);
router.delete('/follow', protect , unfollowUser);
router.get('/followers/:userId', protect , getUserFollowers);
router.get('/following/:userId', protect ,getUserFollowing);
router.get('/follow/check', protect ,checkFollowStatus);
router.get('/follow/count/:userId', protect , getFollowCount);

router.get('/me', protect, getMyProfile);
router.get('/search', protect, searchUsers);
router.get('/:userId', protect, getUserById);
router.put('/me', protect, updateMyProfile);

export default router;