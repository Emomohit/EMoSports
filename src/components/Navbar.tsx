import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, LogOut, Settings, User, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { contentApi } from '../services/api';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { user, logout, activeProfile } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollY, 'change', (latest) => setIsScrolled(latest > 50));

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchRef.current?.focus(), 100);
    else { setSearchQuery(''); setSearchResults([]); }
  }, [isSearchOpen]);

  // Debounced live search — fires 400ms after user stops typing
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return; }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await contentApi.search(searchQuery);
        setSearchResults(res?.data?.slice(0, 8) || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchQuery]);

  const handleSearchResultClick = (item: any) => {
    setIsSearchOpen(false);
    window.dispatchEvent(new CustomEvent('openModal', { detail: item }));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const avatarLetter = activeProfile?.name?.[0] || user?.name?.[0] || 'U';
  const avatarColor = (activeProfile as any)?.avatarColor || '#0a84ff';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'}`}
      >
        <div className="flex items-center justify-between px-[5%] h-[68px]">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
              emoplay<span className="text-[12px] text-[#0a84ff] align-top ml-0.5">+</span>
            </NavLink>

            <div className="hidden md:flex items-center gap-6 text-[14.5px] font-medium text-[#98989d]">
              {[['/', 'Home'], ['/shows', 'Shows'], ['/movies', 'Movies'], ['/pricing', 'Pricing']].map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => isActive ? 'text-white font-semibold' : 'hover:text-white transition-colors'}
                >{label}</NavLink>
              ))}
            </div>
          </div>

          {/* Right: Search, Bell, Profile */}
          <div className="flex items-center gap-5 relative">

            {/* Search Bar */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <input
                      ref={searchRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
                      placeholder="Search movies, shows..."
                      className="w-full bg-black/80 border border-white/20 text-white text-sm px-4 py-2 rounded-lg outline-none focus:border-[#0a84ff] transition-colors placeholder-[#57575b]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="ml-2 text-white hover:text-[#0a84ff] transition-colors flex-shrink-0"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />)}
              </button>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchOpen && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-[#111113]/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    {searchResults.map((item) => (
                      <button
                        key={`${item.id}-${item.mediaType}`}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-10 h-14 rounded bg-[#222] flex-shrink-0 overflow-hidden">
                          {item.poster
                            ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-[#333]" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                          <p className="text-[#98989d] text-xs capitalize">{item.mediaType} · {item.year}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="text-white hover:text-[#0a84ff] transition-colors hidden sm:block relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black" />
            </button>

            {/* Profile Avatar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold cursor-pointer ring-2 ring-transparent hover:ring-[#0a84ff] transition-all"
                  style={{ background: avatarColor }}
                >
                  {activeProfile?.avatar
                    ? <img src={activeProfile.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                    : avatarLetter
                  }
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-[120%] w-52 bg-[#111113] border border-white/10 rounded-xl shadow-2xl py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white text-sm font-semibold">{user.name}</p>
                        <p className="text-[#98989d] text-xs truncate">{user.email}</p>
                      </div>
                      <button onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#98989d] hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors">
                        <User className="w-4 h-4" /> Profiles
                      </button>
                      <button onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#98989d] hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink to="/login"
                className="px-4 py-1.5 bg-[#0a84ff] text-white text-sm font-bold rounded-lg hover:bg-[#0070e0] transition-all hover:scale-105 active:scale-95">
                Sign In
              </NavLink>
            )}

            <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 bg-black/97 backdrop-blur-2xl"
          >
            <div className="p-6 flex justify-between items-center border-b border-white/10">
              <span className="text-xl font-black text-white">emoplay<span className="text-[#0a84ff]">+</span></span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X className="w-8 h-8" /></button>
            </div>
            <div className="flex flex-col gap-1 px-6 pt-6 text-[#98989d]">
              {[['/', 'Home'], ['/shows', 'Shows'], ['/movies', 'Movies'], ['/pricing', 'Pricing']].map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `text-2xl font-bold py-3 transition-colors ${isActive ? 'text-white' : 'hover:text-white'}`}
                >{label}</NavLink>
              ))}
              {!user && (
                <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold py-3 text-[#0a84ff]">
                  Sign In
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
