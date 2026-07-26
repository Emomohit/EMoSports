import type { MediaItem } from './tmdb';

/**
 * Global State Store for EMoSports
 * Manages the cached media items and the user's "My List" collection.
 */

export const allLoadedItems: MediaItem[] = []; // Cache to lookup items for modals
export const myListIds = new Set<number>(); // Set of IDs in the user's watchlist
