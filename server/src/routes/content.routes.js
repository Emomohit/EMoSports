import { Router } from 'express';
import * as content from '../controllers/content.controller.js';

const router = Router();

// Public routes — no auth required for browsing content
router.get('/trending', content.getTrending);
router.get('/genres', content.getGenres);
router.get('/genre/:id', content.getByGenre);
router.get('/search', content.searchContent);
router.get('/:type/:id', content.getContentDetail);

export default router;
