import Profile from '../models/Profile.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { DEFAULT_EMOJI, DEFAULT_COLOR } from '../config/cloudinary.js';

// ─── GET /api/profiles ────────────────────────────────────────────────────────
export const getProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ user: req.user._id })
      .select('name avatarEmoji avatarColor isKids language maturityRating');
    return successResponse(res, profiles, 'Profiles fetched');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/profiles ───────────────────────────────────────────────────────
export const createProfile = async (req, res, next) => {
  try {
    const count = await Profile.countDocuments({ user: req.user._id });
    if (count >= 5) return errorResponse(res, 'Maximum of 5 profiles allowed per account', 400);

    const { name, isKids, language, maturityRating, avatarEmoji, avatarColor } = req.body;

    const profile = await Profile.create({
      user: req.user._id,
      name,
      avatarEmoji: avatarEmoji || DEFAULT_EMOJI,
      avatarColor: avatarColor || DEFAULT_COLOR,
      isKids: isKids ?? false,
      language: language || 'en',
      maturityRating: maturityRating || 'all',
    });

    return successResponse(res, profile, 'Profile created', 201);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/profiles/:id ────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, user: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    const { name, isKids, language, maturityRating, avatarEmoji, avatarColor } = req.body;
    if (name         !== undefined) profile.name         = name;
    if (isKids       !== undefined) profile.isKids       = isKids;
    if (language     !== undefined) profile.language     = language;
    if (maturityRating !== undefined) profile.maturityRating = maturityRating;
    if (avatarEmoji  !== undefined) profile.avatarEmoji  = avatarEmoji;
    if (avatarColor  !== undefined) profile.avatarColor  = avatarColor;

    await profile.save();
    return successResponse(res, profile, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/profiles/:id ─────────────────────────────────────────────────
export const deleteProfile = async (req, res, next) => {
  try {
    const count = await Profile.countDocuments({ user: req.user._id });
    if (count <= 1) return errorResponse(res, 'You must keep at least one profile', 400);

    const deleted = await Profile.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return errorResponse(res, 'Profile not found', 404);

    return successResponse(res, null, 'Profile deleted');
  } catch (err) {
    next(err);
  }
};
