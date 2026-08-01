import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, myListApi, setTokens, clearTokens, getAccessToken } from '../services/api';

type UserProfile = { id: string; name: string; avatar: string; avatarColor?: string; isKids?: boolean; };
type User = { id: string; name: string; email: string; subscription?: any; };

type AppContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  setActiveProfile: (profile: UserProfile) => void;
  myListIds: Set<number>;
  toggleMyList: (item: { id: number; mediaType: string; title: string; poster?: string; backdrop?: string; year?: string; rating?: string }) => Promise<boolean>;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<UserProfile | null>(null);
  const [myListIds, setMyListIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // ─── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      if (!token) { setIsLoading(false); return; }
      try {
        const res = await authApi.me();
        if (res.success) {
          setUser(res.data.user);
          const mapped = res.data.profiles.map((p: any) => ({ id: p._id, name: p.name, avatar: p.avatar || '', avatarEmoji: p.avatarEmoji || '🎬', avatarColor: p.avatarColor, isKids: p.isKids }));
          setProfiles(mapped);
          // Restore active profile from session storage
          const savedProfile = sessionStorage.getItem('emoplay_active_profile');
          if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            setActiveProfileState(parsed);
            await loadMyList(parsed.id);
          } else if (mapped.length > 0) {
            setActiveProfileState(mapped[0]);
            await loadMyList(mapped[0].id);
          }
        }
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const loadMyList = async (profileId: string) => {
    try {
      const res = await myListApi.get(profileId);
      if (res.success) {
        setMyListIds(new Set(res.data.map((item: any) => item.tmdbId)));
      }
    } catch {
      setMyListIds(new Set());
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.success) throw new Error(res.message || 'Login failed');
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    const mapped = (res.data.profiles || []).map((p: any) => ({ id: p._id, name: p.name, avatar: p.avatar || '', avatarEmoji: p.avatarEmoji || '🎬', avatarColor: p.avatarColor, isKids: p.isKids }));
    setProfiles(mapped);
    if (mapped.length > 0) {
      setActiveProfileState(mapped[0]);
      sessionStorage.setItem('emoplay_active_profile', JSON.stringify(mapped[0]));
      await loadMyList(mapped[0].id);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await authApi.signup(name, email, password);
    if (!res.success) throw new Error(res.message || 'Signup failed');
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    // Fetch fresh profiles after signup
    const meRes = await authApi.me();
    const mapped = (meRes.data.profiles || []).map((p: any) => ({ id: p._id, name: p.name, avatar: p.avatar || '', avatarEmoji: p.avatarEmoji || '🎬', avatarColor: p.avatarColor }));
    setProfiles(mapped);
    if (mapped.length > 0) {
      setActiveProfileState(mapped[0]);
      sessionStorage.setItem('emoplay_active_profile', JSON.stringify(mapped[0]));
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearTokens();
    sessionStorage.removeItem('emoplay_active_profile');
    setUser(null);
    setProfiles([]);
    setActiveProfileState(null);
    setMyListIds(new Set());
  };

  const setActiveProfile = useCallback(async (profile: UserProfile) => {
    setActiveProfileState(profile);
    sessionStorage.setItem('emoplay_active_profile', JSON.stringify(profile));
    await loadMyList(profile.id);
  }, []);

  const toggleMyList = useCallback(async (item: { id: number; mediaType: string; title: string; poster?: string; backdrop?: string; year?: string; rating?: string }) => {
    if (!activeProfile) return false;

    const isInList = myListIds.has(item.id);
    // Optimistic update
    const newSet = new Set(myListIds);
    if (isInList) {
      newSet.delete(item.id);
      setMyListIds(newSet);
      try {
        await myListApi.remove(item.id, activeProfile.id, item.mediaType);
      } catch { newSet.add(item.id); setMyListIds(newSet); }
      return false;
    } else {
      newSet.add(item.id);
      setMyListIds(newSet);
      try {
        await myListApi.add({
          profileId: activeProfile.id,
          tmdbId: item.id,
          mediaType: item.mediaType,
          title: item.title,
          poster: item.poster,
          backdrop: item.backdrop,
          year: item.year,
          rating: item.rating,
        });
      } catch { newSet.delete(item.id); setMyListIds(newSet); }
      return true;
    }
  }, [activeProfile, myListIds]);

  return (
    <AppContext.Provider value={{ user, isLoading, login, signup, logout, activeProfile, profiles, setActiveProfile, myListIds, toggleMyList }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
