import MyList from '../models/MyList.model.js';
import Profile from '../models/Profile.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─── Helper: verify profile belongs to this user ──────────────────────────────
const verifyProfile = async (profileId, userId) => {
  return Profile.findOne({ _id: profileId, user: userId });
};

// ─── GET /api/mylist?profileId= ───────────────────────────────────────────────
export const getMyList = async (req, res, next) => {
  try {
    const { profileId } = req.query;
    if (!profileId) return errorResponse(res, 'profileId query param is required', 400);

    const profile = await verifyProfile(profileId, req.user._id);
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    const list = await MyList.find({ profile: profileId })
      .sort({ addedAt: -1 })
      .select('tmdbId mediaType title poster backdrop year rating addedAt');

    return successResponse(res, list, 'My List fetched');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/mylist/add ─────────────────────────────────────────────────────
export const addToList = async (req, res, next) => {
  try {
    const { profileId, tmdbId, mediaType, title, poster, backdrop, year, rating } = req.body;

    const profile = await verifyProfile(profileId, req.user._id);
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    // Upsert — idempotent, safe to call multiple times
    const item = await MyList.findOneAndUpdate(
      { profile: profileId, tmdbId, mediaType },
      { user: req.user._id, profile: profileId, tmdbId, mediaType, title, poster, backdrop, year, rating, addedAt: new Date() },
      { upsert: true, new: true }
    );

    return successResponse(res, item, 'Added to My List', 201);
  } catch (err) {
    if (err.code === 11000) return successResponse(res, null, 'Already in My List');
    next(err);
  }
};

// ─── DELETE /api/mylist/remove/:tmdbId ────────────────────────────────────────
export const removeFromList = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { profileId, mediaType } = req.query;

    if (!profileId) return errorResponse(res, 'profileId query param is required', 400);

    const profile = await verifyProfile(profileId, req.user._id);
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    const deleted = await MyList.findOneAndDelete({
      profile: profileId,
      tmdbId: Number(tmdbId),
      ...(mediaType && { mediaType }),
    });

    if (!deleted) return errorResponse(res, 'Item not found in My List', 404);
    return successResponse(res, null, 'Removed from My List');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/mylist/check/:tmdbId ───────────────────────────────────────────
export const checkInList = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { profileId } = req.query;

    if (!profileId) return errorResponse(res, 'profileId query param is required', 400);

    const item = await MyList.findOne({
      profile: profileId,
      tmdbId: Number(tmdbId),
    });

    return successResponse(res, { inList: !!item }, 'Check complete');
  } catch (err) {
    next(err);
  }
};
