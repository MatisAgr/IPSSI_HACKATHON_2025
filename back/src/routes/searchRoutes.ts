import express from 'express';
import { searchUserByHashtag, searchPostsByTag, searchPostsByKeyword} from '../controllers/searchController';

const router = express.Router();

// Routes de recherche
router.get('/user/:hashtag', searchUserByHashtag);
router.get('/posts/:tag', searchPostsByTag);
router.get('/posts/keyword/:keyword', searchPostsByKeyword);


export default router;