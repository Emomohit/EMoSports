import ContentCache from '../models/ContentCache.model.js';

const TMDB_KEY = process.env.TMDB_API_KEY;
const BASE = process.env.TMDB_BASE_URL || 'https://api.tmdb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';
const IMG_LG = 'https://image.tmdb.org/t/p/original';
const CACHE_TTL_HOURS = 1;

// ─── Internal Fetch with DB Cache ────────────────────────────────────────────
async function cachedFetch(endpoint, ttlHours = CACHE_TTL_HOURS) {
  const cacheKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');

  // 1. Try cache first
  const cached = await ContentCache.findOne({ cacheKey });
  if (cached) return cached.data;

  // 2. Fetch from TMDB
  const res = await fetch(`${BASE}${endpoint}&api_key=${TMDB_KEY}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  const json = await res.json();

  // 3. Store in cache with TTL
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  await ContentCache.findOneAndUpdate(
    { cacheKey },
    { cacheKey, data: json, expiresAt },
    { upsert: true, new: true }
  );

  return json;
}

// ─── Normalizer ──────────────────────────────────────────────────────────────
const PALETTES = [
  ['#2b2d33', '#0d0e10'], ['#3a3226', '#100e0a'], ['#243330', '#0b100f'],
  ['#332b3a', '#100d13'], ['#3a2b2b', '#120b0b'], ['#26303a', '#0b0e11'],
];

function posterGrad(id) {
  const [c1, c2] = PALETTES[id % PALETTES.length];
  return `linear-gradient(${100 + (id * 11) % 70}deg, ${c1} 0%, ${c2} 100%)`;
}

export function normalizeItem(m, forceType = '') {
  if (!m) return null;
  const isTv = forceType === 'tv' || m.media_type === 'tv' || !!m.name;
  return {
    id: m.id,
    tmdbId: m.id,
    title: m.title || m.name || 'Untitled',
    year: (m.release_date || m.first_air_date || '').substring(0, 4),
    rating: m.adult ? '18+' : '16+',
    genres: m.genre_ids?.map(String) || [],
    match: `${Math.floor(Math.random() * 20 + 80)}% Match`,
    duration: isTv ? '1 Season' : 'Film',
    grad: posterGrad(m.id),
    desc: m.overview || 'Experience the magic of cinema.',
    poster: m.poster_path ? `${IMG}${m.poster_path}` : '',
    backdrop: m.backdrop_path ? `${IMG_LG}${m.backdrop_path}` : (m.poster_path ? `${IMG}${m.poster_path}` : ''),
    mediaType: isTv ? 'tv' : 'movie',
    popularity: m.popularity || 0,
    voteAverage: m.vote_average || 0,
  };
}

// ─── Public API Methods ───────────────────────────────────────────────────────

export async function getTrending(page = 1) {
  const [movies, tv] = await Promise.all([
    cachedFetch(`/trending/movie/week?language=en-US&page=${page}`),
    cachedFetch(`/trending/tv/week?language=en-US&page=${page}`),
  ]);
  return {
    movies: (movies.results || []).filter(m => m.poster_path).map(m => normalizeItem(m, 'movie')),
    tv: (tv.results || []).filter(m => m.poster_path).map(m => normalizeItem(m, 'tv')),
  };
}

export async function getByGenre(genreId, mediaType = 'movie', page = 1) {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const data = await cachedFetch(
    `/discover/${type}?with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=${page}`
  );
  return (data.results || []).filter(m => m.poster_path).map(m => normalizeItem(m, type));
}

export async function searchContent(query, page = 1) {
  const data = await cachedFetch(
    `/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`,
    0.25 // Cache search results for only 15 minutes
  );
  return (data.results || [])
    .filter(m => m.media_type !== 'person' && m.poster_path)
    .map(m => normalizeItem(m));
}

export async function getContentDetail(tmdbId, mediaType) {
  const type = mediaType === 'tv' ? 'tv' : 'movie';

  // Fetch full detail + videos + credits in parallel
  const [detail, credits, videos] = await Promise.all([
    cachedFetch(`/${type}/${tmdbId}?language=en-US`, 6),
    cachedFetch(`/${type}/${tmdbId}/credits?language=en-US`, 6),
    cachedFetch(`/${type}/${tmdbId}/videos?language=en-US`, 6),
  ]);

  // Extract the official trailer YouTube key
  const trailer = videos.results?.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  ) || videos.results?.[0];

  // Top 8 cast members
  const cast = (credits.cast || []).slice(0, 8).map(c => ({
    id: c.id,
    name: c.name,
    character: c.character,
    photo: c.profile_path ? `${IMG}${c.profile_path}` : null,
  }));

  const director = (credits.crew || []).find(c => c.job === 'Director');

  return {
    id: detail.id,
    tmdbId: detail.id,
    title: detail.title || detail.name,
    tagline: detail.tagline || '',
    overview: detail.overview || '',
    poster: detail.poster_path ? `${IMG}${detail.poster_path}` : '',
    backdrop: detail.backdrop_path ? `${IMG_LG}${detail.backdrop_path}` : '',
    year: (detail.release_date || detail.first_air_date || '').substring(0, 4),
    runtime: detail.runtime || (detail.episode_run_time?.[0]) || 0,
    rating: detail.adult ? '18+' : '16+',
    voteAverage: detail.vote_average,
    voteCount: detail.vote_count,
    genres: (detail.genres || []).map(g => g.name),
    genreIds: (detail.genres || []).map(g => g.id),
    mediaType: type,
    status: detail.status,
    // YouTube trailer key — used by the frontend YouTube IFrame player
    trailerKey: trailer?.key || null,
    trailerUrl: trailer?.key ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0` : null,
    cast,
    director: director?.name || null,
    numberOfSeasons: detail.number_of_seasons || null,
    numberOfEpisodes: detail.number_of_episodes || null,
  };
}

export async function getGenreList(mediaType = 'movie') {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const data = await cachedFetch(`/genre/${type}/list?language=en-US`, 24);
  return data.genres || [];
}
