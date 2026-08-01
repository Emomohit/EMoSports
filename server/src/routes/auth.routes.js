import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validate.js';

const router = Router();

// Strict rate limit for auth endpoints — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
});

router.post('/signup', authLimiter, validate(signupSchema), auth.signup);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/refresh', auth.refreshToken);
router.post('/logout', protect, auth.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), auth.resetPassword);
router.get('/me', protect, auth.getMe);

export default router;
