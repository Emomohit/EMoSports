import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchMovies, type MediaItem } from '../services/tmdb';
import { Play, Plus, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const GENRES = [
  { id: '', name: 'All Movies' },
  { id: '28', name: 'Action' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '878', name: 'Sci-Fi' },
  { id: '27', name: 'Horror' },
  { id: '53', name: 'Thriller' },
  { id: '10749', name: 'Romance' },
];

const Movies = () => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const { myListIds, toggleMyList } = useAppContext();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const page1 = await fetchMovies(selectedGenre, 1);
        const page2 = await fetchMovies(selectedGenre, 2);
        setMovies([...page1, ...page2]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedGenre]);

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
      {/* Header & Genre Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Movies</h1>
          <p className="text-[#98989d] text-sm mt-1">Explore trending blockbusters, action, drama & more</p>
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                selectedGenre === g.id
                  ? 'bg-[#0a84ff] text-white shadow-[0_0_15px_rgba(10,132,255,0.4)] scale-105'
                  : 'bg-white/5 text-[#98989d] hover:bg-white/10 hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {movies.map((m) => {
            const isInList = myListIds.has(m.id);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -6 }}
                onClick={() => handleCardClick(m)}
                className="group cursor-pointer relative rounded-xl overflow-hidden bg-[#151517] border border-white/10 shadow-lg"
              >
                <div className="aspect-[2/3] relative">
                  <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2">{m.title}</p>
                    <div className="flex items-center gap-2 text-xs text-[#98989d] mb-3">
                      <span className="text-[#30d158] font-bold">{m.match}%</span>
                      <span>{m.year}</span>
                      <span className="px-1 border border-white/20 rounded text-[10px]">{m.rating}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handlePlayClick(e, m)}
                        className="flex-1 py-2 bg-white text-black font-bold text-xs rounded-lg flex items-center justify-center gap-1 hover:bg-white/90"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> Play
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMyList({
                            id: m.id,
                            mediaType: 'movie',
                            title: m.title,
                            poster: m.poster,
                            backdrop: m.backdrop,
                            year: m.year,
                            rating: m.rating,
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

export default Movies;
