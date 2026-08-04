import * as tmdb from '../services/tmdb.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─── GET /api/content/trending ────────────────────────────────────────────────
export const getTrending = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdb.getTrending(Number(page));
    return successResponse(res, data, 'Trending content fetched');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/content/genre/:id ───────────────────────────────────────────────
export const getByGenre = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mediaType = 'movie', page = 1 } = req.query;
    const data = await tmdb.getByGenre(id, mediaType, Number(page));
    return successResponse(res, data, `Genre ${id} content fetched`);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/content/search ──────────────────────────────────────────────────
export const searchContent = async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q || q.trim().length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', 400);
    }
    const data = await tmdb.searchContent(q.trim(), Number(page));
    return successResponse(res, data, `Search results for "${q}"`);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/content/:type/:id ───────────────────────────────────────────────
export const getContentDetail = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    if (!['movie', 'tv'].includes(type)) {
      return errorResponse(res, 'Media type must be "movie" or "tv"', 400);
    }
    const data = await tmdb.getContentDetail(Number(id), type);
    return successResponse(res, data, 'Content detail fetched');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/content/genres ──────────────────────────────────────────────────
export const getGenres = async (req, res, next) => {
  try {
    const { mediaType = 'movie' } = req.query;
    const data = await tmdb.getGenreList(mediaType);
    return successResponse(res, data, 'Genre list fetched');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/content/sports ──────────────────────────────────────────────────
export const getSportsMatches = async (req, res, next) => {
  try {
    const sportsData = [
      {
        id: 'match-1',
        title: 'ICC T20 World Cup Final',
        category: 'Cricket',
        team1: { name: 'India', flag: '🇮🇳', score: '176/7 (20.0)' },
        team2: { name: 'South Africa', flag: '🇿🇦', score: '169/8 (20.0)' },
        status: 'LIVE',
        timeOrPeriod: 'Final Over · Need 16 off 6',
        thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      },
      {
        id: 'match-2',
        title: 'UEFA Champions League Final',
        category: 'Football',
        team1: { name: 'Real Madrid', flag: '🇪🇸', score: '2' },
        team2: { name: 'Borussia Dortmund', flag: '🇩🇪', score: '0' },
        status: 'LIVE',
        timeOrPeriod: '88th Minute',
        thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      },
    ];
    return successResponse(res, sportsData, 'Live sports matches fetched');
  } catch (err) {
    next(err);
  }
};

