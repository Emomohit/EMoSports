import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, saveProgressSchema } from '../middleware/validate.js';
import * as progress from '../controllers/progress.controller.js';

const router = Router();

router.use(protect);

router.get('/', progress.getProgress);
router.post('/', validate(saveProgressSchema), progress.saveProgress);
router.delete('/:tmdbId', progress.deleteProgress);

export default router;
