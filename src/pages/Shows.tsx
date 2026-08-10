import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchTVShows, type MediaItem } from '../services/tmdb';
import { Play, Plus, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Shows = () => {
  const [shows, setShows] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { myListIds, toggleMyList } = useAppContext();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const page1 = await fetchTVShows(1);
        const page2 = await fetchTVShows(2);
        setShows([...page1, ...page2]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCardClick = (item: MediaItem) => {
    window.dispatchEvent(new CustomEvent('openModal', { detail: item }));
  };

  const handlePlayClick = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('playMedia', { detail: item }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#08080a] pt-28 pb-24 px-[5%]"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">TV Shows & Series</h1>
        <p className="text-[#98989d] text-sm mt-1">Binge top-rated Indian & global web series</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {shows.map((s) => {
            const isInList = myListIds.has(s.id);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -6 }}
                onClick={() => handleCardClick(s)}
                className="group cursor-pointer relative rounded-xl overflow-hidden bg-[#151517] border border-white/10 shadow-lg"
              >
                <div className="aspect-[2/3] relative">
                  <img src={s.poster} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2">{s.title}</p>
                    <div className="flex items-center gap-2 text-xs text-[#98989d] mb-3">
                      <span className="text-[#30d158] font-bold">{s.match}%</span>
                      <span>{s.year}</span>
                      <span className="px-1 border border-white/20 rounded text-[10px]">{s.rating}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handlePlayClick(e, s)}
                        className="flex-1 py-2 bg-white text-black font-bold text-xs rounded-lg flex items-center justify-center gap-1 hover:bg-white/90"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> Play
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMyList({
                            id: s.id,
                            mediaType: 'tv',
                            title: s.title,
                            poster: s.poster,
                            backdrop: s.backdrop,
                            year: s.year,
                            rating: s.rating,
                          });
                        }}
                        className="w-8 h-8 bg-white/20 text-white rounded-lg flex items-center justify-center hover:bg-white/30 backdrop-blur"
                      >
                        {isInList ? <Check className="w-4 h-4 text-[#30d158]" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Shows;
