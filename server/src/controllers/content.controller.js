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
