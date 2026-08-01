import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, addToListSchema } from '../middleware/validate.js';
import * as mylist from '../controllers/mylist.controller.js';

const router = Router();

// All mylist routes require authentication
router.use(protect);

router.get('/', mylist.getMyList);
router.get('/check/:tmdbId', mylist.checkInList);
router.post('/add', validate(addToListSchema), mylist.addToList);
router.delete('/remove/:tmdbId', mylist.removeFromList);

export default router;
