import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as subscription from '../controllers/subscription.controller.js';

const router = Router();

// Plans are public
router.get('/plans', subscription.getPlans);

// Subscribe/cancel require auth
router.post('/', protect, subscription.subscribe);
router.delete('/', protect, subscription.cancelSubscription);

export default router;
