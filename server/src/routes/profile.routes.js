import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, createProfileSchema, updateProfileSchema } from '../middleware/validate.js';
import * as profile from '../controllers/profile.controller.js';

const router = Router();

// All profile routes require authentication — no file upload middleware needed
router.use(protect);

router.get('/',      profile.getProfiles);
router.post('/',     validate(createProfileSchema), profile.createProfile);
router.put('/:id',   validate(updateProfileSchema), profile.updateProfile);
router.delete('/:id', profile.deleteProfile);

export default router;
