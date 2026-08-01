/**
 * Zero-cost Avatar System
 * ─────────────────────────────────────────────────────────────────────────────
 * No Cloudinary. No file uploads. No storage costs.
 *
 * Avatars are stored as two tiny fields in the Profile MongoDB document:
 *   avatarEmoji  → e.g. "🦁" (1–4 bytes in UTF-8)
 *   avatarColor  → e.g. "#0a84ff" (7 bytes)
 *
 * This is exactly how Netflix, Disney+, and most streaming platforms
 * handle profile avatars — preset options, not custom uploads.
 * Total storage per profile: < 20 bytes.  Cost: $0 forever.
 */

export const PRESET_AVATARS = [
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🐯', label: 'Tiger' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🦅', label: 'Eagle' },
  { emoji: '🐉', label: 'Dragon' },
  { emoji: '🦋', label: 'Butterfly' },
  { emoji: '🌙', label: 'Moon' },
  { emoji: '⚡', label: 'Lightning' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎭', label: 'Mask' },
  { emoji: '🎬', label: 'Clapboard' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '🌊', label: 'Wave' },
  { emoji: '🎮', label: 'Controller' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '💎', label: 'Diamond' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '🌸', label: 'Cherry Blossom' },
  { emoji: '🦄', label: 'Unicorn' },
];

export const PRESET_COLORS = [
  '#0a84ff', // Electric Blue
  '#5e5ce6', // Indigo
  '#bf5af2', // Purple
  '#ff375f', // Red
  '#ff9f0a', // Orange
  '#30d158', // Green
  '#2c2c2e', // Dark Grey
  '#1c1c1e', // Near Black
  '#7b1e1e', // Deep Red
  '#225b30', // Forest Green
  '#0d3a6e', // Dark Navy
  '#4a1a6b', // Deep Purple
];

export const DEFAULT_EMOJI  = '🎬';
export const DEFAULT_COLOR  = '#0a84ff';
