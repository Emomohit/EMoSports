/**
 * TMDB API Service Module
 * Centralizes all TMDB API interactions for the emoplay+ streaming platform.
 * Provides typed fetchers for movies, TV shows, and search functionality.
 */

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const TMDB_BASE = 'https://api.tmdb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMG_LG = 'https://image.tmdb.org/t/p/original';

/** Visual gradient palettes for poster card backgrounds */
const PALETTES = [
  ["#2b2d33","#0d0e10"], ["#3a3226","#100e0a"], ["#243330","#0b100f"],
  ["#332b3a","#100d13"], ["#2f2a24","#0f0d0a"], ["#26303a","#0b0e11"],
  ["#3a2b2b","#120b0b"], ["#2a3226","#0c0f0a"], ["#302a3a","#0f0d13"],
  ["#3a3430","#120f0c"], ["#293a3a","#0a1010"], ["#3a2f2b","#120e0b"],
];

function posterStyle(seed: number): string {
  const [c1, c2] = PALETTES[seed % PALETTES.length];
  const angle = 100 + (seed * 11) % 70;
  return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
}

export interface MediaItem {
  id: number;
  title: string;
  year: string;
  rating: string;
  genres: string[];
  match: number;
  duration: string;
  grad: string;
  desc: string;
  cast: string;
  progress: number;
  isNew: boolean;
  poster: string;
  backdrop: string;
  mediaType: 'movie' | 'tv';
  iframeSrc: string;
}

/**
 * Transforms raw TMDB API results into normalized MediaItem objects.
 */
export function formatTMDB(results: any[], forceType: string): MediaItem[] {
  if (!results) return [];
  return results.filter((m: any) => m.poster_path).map((m: any) => {
    const isTv = forceType === 'tv' || m.media_type === 'tv';
    return {
      id: m.id,
      title: m.title || m.name,
      year: (m.release_date || m.first_air_date || '2024').substring(0, 4),
      rating: m.adult ? '18+' : '16+',
      genres: [isTv ? 'TV Show' : 'Movie'],
      match: Math.floor(Math.random() * 20) + 80,
      duration: isTv ? '1 Season' : 'Film',
      grad: posterStyle(m.id),
      desc: m.overview || "Experience the magic of cinema.",
      cast: "Cast info unavailable.",
      progress: 0,
      isNew: m.popularity > 1000,
      poster: `${TMDB_IMG}${m.poster_path}`,
      backdrop: m.backdrop_path ? `${TMDB_IMG_LG}${m.backdrop_path}` : `${TMDB_IMG}${m.poster_path}`,
      mediaType: isTv ? 'tv' : 'movie',
      iframeSrc: isTv ? `https://autoembed.co/tv/tmdb/${m.id}` : `https://www.2embed.cc/embed/${m.id}`
    } as MediaItem;
  });
}

/**
 * Fetches discover movies from TMDB, optionally filtered by genre.
 */
export async function fetchMovies(genreId?: string, page = 1): Promise<MediaItem[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    let url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=${page}&language=en-US&primary_release_date.lte=${today}`;
    if (genreId) url += `&with_genres=${genreId}`;
    const res = await fetch(url);
    const data = await res.json();
    return formatTMDB(data.results, 'movie');
  } catch {
    return [];
  }
}

/**
 * Fetches discover TV shows from TMDB.
 */
export async function fetchTVShows(page = 1): Promise<MediaItem[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=${page}&language=en-US&first_air_date.lte=${today}`);
    const data = await res.json();
    return formatTMDB(data.results, 'tv');
  } catch {
    return [];
  }
}

/**
 * Searches TMDB for movies and TV shows matching the query.
 */
export async function searchTMDB(query: string): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
    const data = await res.json();
    return formatTMDB(data.results.filter((i: any) => i.media_type !== 'person'), '');
  } catch {
    return [];
  }
}
