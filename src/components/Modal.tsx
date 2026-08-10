import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, X, Star, Loader2, PlayCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { contentApi } from '../services/api';

const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<any>(null);         // base item from card click
  const [detail, setDetail] = useState<any>(null);     // enriched detail from backend
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const { myListIds, toggleMyList } = useAppContext();

  useEffect(() => {
    const handleOpen = (e: any) => {
      setItem(e.detail);
      setDetail(null);
      setIsOpen(true);
    };
    window.addEventListener('openModal', handleOpen);
    return () => window.removeEventListener('openModal', handleOpen);
  }, []);

  // Fetch full detail + cast + trailer from backend whenever modal opens
  useEffect(() => {
    if (!isOpen || !item?.id) return;
    // Skip for custom items (India's Got Latent etc.)
    if (item.id > 900000) return;

    setIsLoadingDetail(true);
    const type = item.mediaType === 'tv' ? 'tv' : 'movie';
    contentApi.detail(type, item.id)
      .then(res => { if (res?.success) setDetail(res.data); })
      .catch(() => {})
      .finally(() => setIsLoadingDetail(false));
  }, [isOpen, item]);

  const handleClose = () => { setIsOpen(false); setItem(null); setDetail(null); };

  const handlePlay = () => {
    handleClose();
    // Merge backend detail (trailerUrl etc.) with base item
    const merged = { ...item, ...(detail || {}) };
    window.dispatchEvent(new CustomEvent('playMedia', { detail: merged }));
  };

  const handleToggleList = () => {
    if (!item) return;
    const merged = { ...item, ...(detail || {}) };
    toggleMyList({
      id: merged.id,
      mediaType: merged.mediaType || 'movie',
      title: merged.title,
      poster: merged.poster,
      backdrop: merged.backdrop,
      year: merged.year,
      rating: merged.rating,
    });
  };

  if (!item) return null;

  const d = detail || item;
  const isInList = myListIds.has(item.id);
  const castList: any[] = d.cast || [];
  const genreList: string[] = d.genres || [];
  const voteAvg = d.voteAverage ? Number(d.voteAverage).toFixed(1) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 30 }}
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}
            className="relative w-full max-w-3xl bg-[#111113] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black rounded-full flex items-center justify-center text-white z-20 backdrop-blur transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Backdrop */}
            <div className="relative h-[220px] sm:h-[340px] md:h-[400px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                style={{ backgroundImage: `url(${d.backdrop || d.poster || item.backdrop || item.poster})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/50 to-transparent" />

              {/* Loading overlay for detail fetch */}
              {isLoadingDetail && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[#0a84ff]" />
                  <span className="text-[#98989d] text-xs">Loading details...</span>
                </div>
              )}

              {/* Title + Meta Overlay */}
              <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 w-full">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 leading-tight drop-shadow-2xl">
                  {d.title || item.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white/80 mb-5">
                  <span className="text-[#30d158] font-bold">{d.match || item.match}</span>
                  <span>{d.year || item.year}</span>
                  {d.runtime > 0 && <span>{Math.floor(d.runtime / 60)}h {d.runtime % 60}m</span>}
                  <span className="px-2 py-0.5 border border-white/20 rounded text-xs">{d.rating || item.rating}</span>
                  {voteAvg && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {voteAvg}
                    </span>
                  )}
                  <span className="px-1.5 border border-white/20 rounded text-[10px]">HD</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePlay}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold shadow-lg"
                  >
                    {d.trailerKey
                      ? <><PlayCircle className="w-5 h-5 fill-red-600 text-red-600" /> Watch Trailer</>
                      : <><Play className="w-5 h-5 fill-black" /> Play</>
                    }
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleToggleList}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold backdrop-blur border transition-all ${isInList ? 'bg-[#0a84ff]/20 border-[#0a84ff] text-[#0a84ff]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                  >
                    {isInList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isInList ? 'In My List' : 'My List'}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Description */}
                <div className="md:col-span-2">
                  {d.tagline && (
                    <p className="text-[#0a84ff] text-sm font-semibold mb-2 italic">"{d.tagline}"</p>
                  )}
                  <p className="text-[#d4d4d8] text-base leading-relaxed">
                    {d.overview || d.desc || item.desc}
                  </p>

                  {/* Cast grid with photos */}
                  {castList.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-white text-sm font-bold mb-3 uppercase tracking-wider">Cast</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {castList.slice(0, 8).map((actor: any) => (
                          <div key={actor.id} className="flex-shrink-0 text-center w-16">
                            <div className="w-14 h-14 rounded-full mx-auto mb-1 overflow-hidden bg-[#222] ring-2 ring-white/10">
                              {actor.photo
                                ? <img src={actor.photo} alt={actor.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center text-white text-lg font-bold">{actor.name[0]}</div>
                              }
                            </div>
                            <p className="text-white text-[10px] font-medium leading-tight truncate">{actor.name}</p>
                            <p className="text-[#98989d] text-[9px] truncate">{actor.character}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata sidebar */}
                <div className="text-sm space-y-3 text-[#a1a1aa]">
                  {d.director && <p><span className="text-white font-medium">Director: </span>{d.director}</p>}
                  {genreList.length > 0 && (
                    <div>
                      <span className="text-white font-medium">Genres: </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {genreList.slice(0, 4).map((g: string) => (
                          <span key={g} className="px-2.5 py-1 bg-white/8 rounded-full text-xs text-[#d4d4d8] border border-white/10">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {d.status && <p><span className="text-white font-medium">Status: </span>{d.status}</p>}
                  {d.numberOfSeasons && <p><span className="text-white font-medium">Seasons: </span>{d.numberOfSeasons}</p>}
                  {d.voteCount > 0 && <p><span className="text-white font-medium">Votes: </span>{d.voteCount?.toLocaleString()}</p>}
                  {d.trailerKey && (
                    <p className="flex items-center gap-1.5">
                      <PlayCircle className="w-4 h-4 text-red-500" />
                      <span className="text-white font-medium">Trailer available</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
