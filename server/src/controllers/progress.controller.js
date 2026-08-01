import Progress from '../models/Progress.model.js';
import Profile from '../models/Profile.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─── GET /api/progress?profileId= ────────────────────────────────────────────
export const getProgress = async (req, res, next) => {
  try {
    const { profileId } = req.query;
    if (!profileId) return errorResponse(res, 'profileId query param is required', 400);

    const profile = await Profile.findOne({ _id: profileId, user: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    const records = await Progress.find({ profile: profileId, completed: false })
      .sort({ watchedAt: -1 })
      .limit(20)
      .select('tmdbId mediaType title poster timestamp duration percent season episode watchedAt');

    return successResponse(res, records, 'Watch progress fetched');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/progress ───────────────────────────────────────────────────────
export const saveProgress = async (req, res, next) => {
  try {
    const { profileId, tmdbId, mediaType, title, poster, timestamp, duration, season, episode } = req.body;

    const profile = await Profile.findOne({ _id: profileId, user: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    const percent = duration > 0 ? Math.round((timestamp / duration) * 100) : 0;
    const completed = percent >= 90; // Mark as completed if watched ≥90%

    const record = await Progress.findOneAndUpdate(
      { profile: profileId, tmdbId, mediaType },
      {
        user: req.user._id,
        profile: profileId,
        tmdbId, mediaType, title, poster,
        timestamp, duration, percent, completed,
        season: season || null,
        episode: episode || null,
        watchedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return successResponse(res, record, 'Progress saved');
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/progress/:tmdbId ─────────────────────────────────────────────
export const deleteProgress = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { profileId } = req.query;

    if (!profileId) return errorResponse(res, 'profileId query param is required', 400);

    await Progress.findOneAndDelete({ profile: profileId, tmdbId: Number(tmdbId) });
    return successResponse(res, null, 'Progress record removed');
  } catch (err) {
    next(err);
  }
};
