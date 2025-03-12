import express from 'express';
import { searchUserByHashtag, searchPostsByTag } from '../controllers/searchController';

const router = express.Router();

// Routes de recherche
router.get('/user/:hashtag', searchUserByHashtag);
router.get('/posts/:tag', searchPostsByTag);

export default router;