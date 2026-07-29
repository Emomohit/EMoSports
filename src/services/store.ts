import type { MediaItem } from './tmdb';

/**
 * Global State Store for EMoSports
 * Manages the cached media items and the user's "My List" collection with local persistence.
 */

export const allLoadedItems: MediaItem[] = []; // Cache to lookup items for modals

// Initialize My List from local storage if available
const savedList = localStorage.getItem('emo_my_list');
export const myListIds = new Set<number>(savedList ? JSON.parse(savedList) : []);

/**
 * Toggles an item in the user's "My List" and persists the state.
 * @param id The ID of the media item to toggle
 * @returns boolean True if added, false if removed
 */
export const toggleMyList = (id: number): boolean => {
  const isAdded = !myListIds.has(id);
  if (isAdded) {
    myListIds.add(id);
  } else {
    myListIds.delete(id);
  }
  
  // Persist to local storage
  localStorage.setItem('emo_my_list', JSON.stringify(Array.from(myListIds)));
  
  return isAdded;
};
