/**
 * Central Axios instance for all backend API calls.
 * Handles: base URL, auth headers, token refresh, and error normalization.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Token Storage Helpers ────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('emoplay_access_token');
export const getRefreshToken = () => localStorage.getItem('emoplay_refresh_token');
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('emoplay_access_token', access);
  localStorage.setItem('emoplay_refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('emoplay_access_token');
  localStorage.removeItem('emoplay_refresh_token');
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
interface ApiOptions extends RequestInit {
  auth?: boolean;
  skipRefresh?: boolean;
}

async function apiFetch<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { auth = false, skipRefresh = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });

  // Auto-refresh on 401 (expired access token)
  if (res.status === 401 && auth && !skipRefresh) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });
      if (!retryRes.ok) throw await retryRes.json();
      return retryRes.json();
    } else {
      // Refresh failed — force logout
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// ─── Token Refresh ────────────────────────────────────────────────────────────
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.data.accessToken, data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (name: string, email: string, password: string) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST', auth: true }),

  me: () =>
    apiFetch('/auth/me', { auth: true }),

  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};

// ─── Content API ──────────────────────────────────────────────────────────────
export const contentApi = {
  trending: (page = 1) =>
    apiFetch(`/content/trending?page=${page}`),

  byGenre: (genreId: string | number, mediaType = 'movie', page = 1) =>
    apiFetch(`/content/genre/${genreId}?mediaType=${mediaType}&page=${page}`),

  search: (query: string, page = 1) =>
    apiFetch(`/content/search?q=${encodeURIComponent(query)}&page=${page}`),

  detail: (type: 'movie' | 'tv', id: number) =>
    apiFetch(`/content/${type}/${id}`),

  genres: (mediaType = 'movie') =>
    apiFetch(`/content/genres?mediaType=${mediaType}`),
};

// ─── Profile API ──────────────────────────────────────────────────────────────
export const profileApi = {
  list: () =>
    apiFetch('/profiles', { auth: true }),

  create: (data: { name: string; avatarEmoji?: string; avatarColor?: string; isKids?: boolean; language?: string; maturityRating?: string }) =>
    apiFetch('/profiles', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; avatarEmoji?: string; avatarColor?: string; isKids?: boolean; language?: string; maturityRating?: string }) =>
    apiFetch(`/profiles/${id}`, {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/profiles/${id}`, { method: 'DELETE', auth: true }),
};

// ─── MyList API ───────────────────────────────────────────────────────────────
export const myListApi = {
  get: (profileId: string) =>
    apiFetch(`/mylist?profileId=${profileId}`, { auth: true }),

  add: (item: {
    profileId: string; tmdbId: number; mediaType: string;
    title: string; poster?: string; backdrop?: string; year?: string; rating?: string;
  }) => apiFetch('/mylist/add', { method: 'POST', auth: true, body: JSON.stringify(item) }),

  remove: (tmdbId: number, profileId: string, mediaType?: string) =>
    apiFetch(`/mylist/remove/${tmdbId}?profileId=${profileId}${mediaType ? `&mediaType=${mediaType}` : ''}`,
      { method: 'DELETE', auth: true }),

  check: (tmdbId: number, profileId: string) =>
    apiFetch(`/mylist/check/${tmdbId}?profileId=${profileId}`, { auth: true }),
};

// ─── Progress API ─────────────────────────────────────────────────────────────
export const progressApi = {
  get: (profileId: string) =>
    apiFetch(`/progress?profileId=${profileId}`, { auth: true }),

  save: (data: {
    profileId: string; tmdbId: number; mediaType: string;
    title?: string; poster?: string; timestamp: number; duration: number;
    season?: number | null; episode?: number | null;
  }) => apiFetch('/progress', { method: 'POST', auth: true, body: JSON.stringify(data) }),

  remove: (tmdbId: number, profileId: string) =>
    apiFetch(`/progress/${tmdbId}?profileId=${profileId}`, { method: 'DELETE', auth: true }),
};

// ─── Subscription API ─────────────────────────────────────────────────────────
export const subscriptionApi = {
  plans: () => apiFetch('/subscription/plans'),
  subscribe: (planId: string) =>
    apiFetch('/subscription', { method: 'POST', auth: true, body: JSON.stringify({ planId }) }),
  cancel: () =>
    apiFetch('/subscription', { method: 'DELETE', auth: true }),
};

export default apiFetch;
