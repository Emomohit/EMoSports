import Joi from 'joi';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Factory that returns Express middleware for request body validation.
 * Usage: router.post('/signup', validate(signupSchema), authController.signup)
 */
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map(d => ({ field: d.path[0], message: d.message }));
    return errorResponse(res, 'Validation failed', 422, errors);
  }
  next();
};

// ─── Auth Schemas ─────────────────────────────────────────────────────────────
export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(100).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(100).required(),
});

// ─── Profile Schemas ──────────────────────────────────────────────────────────
export const createProfileSchema = Joi.object({
  name: Joi.string().min(1).max(30).required(),
  avatarEmoji: Joi.string().max(8).default('🎬'),
  avatarColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#0a84ff'),
  isKids: Joi.boolean().default(false),
  language: Joi.string().default('en'),
  maturityRating: Joi.string().valid('all', '13+', '16+', '18+').default('all'),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(30),
  avatarEmoji: Joi.string().max(8),
  avatarColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
  isKids: Joi.boolean(),
  language: Joi.string(),
  maturityRating: Joi.string().valid('all', '13+', '16+', '18+'),
});

// ─── MyList Schemas ───────────────────────────────────────────────────────────
export const addToListSchema = Joi.object({
  profileId: Joi.string().required(),
  tmdbId: Joi.number().integer().required(),
  mediaType: Joi.string().valid('movie', 'tv').required(),
  title: Joi.string().required(),
  poster: Joi.string().uri().allow(''),
  backdrop: Joi.string().uri().allow(''),
  year: Joi.string().allow(''),
  rating: Joi.string().allow(''),
});

// ─── Progress Schemas ─────────────────────────────────────────────────────────
export const saveProgressSchema = Joi.object({
  profileId: Joi.string().required(),
  tmdbId: Joi.number().integer().required(),
  mediaType: Joi.string().valid('movie', 'tv').required(),
  title: Joi.string().allow(''),
  poster: Joi.string().uri().allow(''),
  timestamp: Joi.number().min(0).required(),
  duration: Joi.number().min(0).required(),
  season: Joi.number().allow(null),
  episode: Joi.number().allow(null),
});
