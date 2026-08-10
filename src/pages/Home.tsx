import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Row from '../components/Row';
import SportsRow from '../components/SportsRow';
import { contentApi } from '../services/api';
import { fetchMovies, fetchTVShows } from '../services/tmdb';

// ─── Pinned featured items ───────────────────────────────────────────────────
const LATENT_BONUS_EP2 = {
  id: 999900,
  tmdbId: 999900,
  title: "India's Got Latent - S2 Bonus Ep 2",
  year: "2026",
  rating: "16+",
  match: "99% Match",
  duration: "1h 52m",
  desc: "The ultimate chaotic talent showdown featuring Badshah, Sourav Joshi, Harsh Limbachiyaa, Rajat Sood, and Samay Raina!",
  poster: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
  backdrop: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
  mediaType: "tv",
  genres: ["Comedy", "Reality", "Talk Show"],
  grad: "linear-gradient(135deg, #FF1E27 0%, #0d0e10 100%)",
  videoUrl: "https://www.youtube.com/embed/eHTXQW58WhA?autoplay=1",
  trailerUrl: "https://www.youtube.com/embed/eHTXQW58WhA?autoplay=1",
};

const SPIDERMAN_ITEM = {
  id: 969681,
  tmdbId: 969681,
  title: "Spider-Man: Brand New Day",
  year: "2026",
  rating: "16+",
  match: "99% Match",
  duration: "2h 15m",
  desc: "Fighting crime full-time as Spider-Man in a world that doesn't remember him—sparks a change in Peter Parker as dark forces emerge.",
  poster: "https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg",
  backdrop: "https://image.tmdb.org/t/p/original/vjMvFSmGUxEtqVdaZgvFee9XkZl.jpg",
  mediaType: "movie",
  genres: ["Action", "Adventure", "Sci-Fi"],
  grad: "linear-gradient(135deg, #7b1e1e 0%, #0d0e10 100%)",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  trailerKey: null,
};

const LATENT_ITEMS = [
  LATENT_BONUS_EP2,
  {
    id: 999901, tmdbId: 999901, title: "India's Got Latent - EP 1", year: "2026",
    rating: "16+", match: "99% Match", duration: "1h 45m",
    desc: "The very first episode featuring Samay Raina, Alia Bhatt, Sharvari, and Ashish Solanki.",
    poster: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
    backdrop: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
    mediaType: "tv", genres: ["Comedy", "Reality"],
    grad: "linear-gradient(135deg, #2b2d33 0%, #0d0e10 100%)",
    trailerUrl: "https://www.youtube.com/embed/eHTXQW58WhA?autoplay=1",
  },
  {
    id: 999902, tmdbId: 999902, title: "India's Got Latent - EP 4", year: "2026",
    rating: "16+", match: "98% Match", duration: "1h 40m",
    desc: "Episode 4 of Season 2 with even more chaotic talent evaluations.",
    poster: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
    backdrop: "https://i.ytimg.com/vi/eHTXQW58WhA/maxresdefault.jpg",
    mediaType: "tv", genres: ["Comedy", "Reality"],
    grad: "linear-gradient(135deg, #2b2d33 0%, #0d0e10 100%)",
    trailerUrl: "https://www.youtube.com/embed/eHTXQW58WhA?autoplay=1",
  },
];

const Home = () => {
  const [data, setData] = useState<any>({
    movies: [LATENT_BONUS_EP2, SPIDERMAN_ITEM],
    action: [],
    tv: [],
    newTv: [],
    latent: LATENT_ITEMS,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllContent = async () => {
      try {
        let moviesList: any[] = [];
        let actionList: any[] = [];
        let tvList: any[] = [];
        let newTvList: any[] = [];

        // 1. Try Backend API first
        try {
          const [trendingRes, actionRes, tvRes] = await Promise.all([
            contentApi.trending(1),
            contentApi.byGenre(28, 'movie', 1),   // 28 = Action
            contentApi.byGenre(10765, 'tv', 1),   // Sci-Fi TV
          ]);

          if (trendingRes?.data?.movies?.length > 0) {
            moviesList = trendingRes.data.movies;
            tvList     = trendingRes.data.tv || [];
            actionList = actionRes?.data || [];
            newTvList  = tvRes?.data || [];
          }
        } catch {
          // Backend offline or error — silent fallback to direct TMDB API
        }

        // 2. If Backend was offline or returned empty, fetch directly from TMDB
        if (moviesList.length === 0) {
          const [directMovies, directAction, directTv, directTv2] = await Promise.all([
            fetchMovies(),
            fetchMovies('28'),
            fetchTVShows(1),
            fetchTVShows(2),
          ]);
          moviesList = directMovies;
          actionList = directAction;
          tvList     = directTv;
          newTvList  = directTv2;
        }

        setData({
          movies: [LATENT_BONUS_EP2, SPIDERMAN_ITEM, ...moviesList],
          action: actionList,
          tv: tvList,
          newTv: newTvList,
          latent: LATENT_ITEMS,
        });
      } catch (err) {
        console.error("Error loading content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#0a84ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#98989d] text-sm">Loading movies & shows...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '90px' }}
    >
      <Hero slides={data.movies.slice(0, 5)} />

      <div className="rows">
        {/* INDIA'S GOT LATENT AT THE VERY FIRST & TOP ROW */}
        <Row title="🎤 India's Got Latent (Latest Episodes)" items={data.latent} />
        <Row title="🔥 Top 10 Today"                        items={data.movies.slice(0, 10)} isRanked={true} />
        <Row title="Trending Movies"                         items={data.movies.slice(1, 20)} />
        {data.tv.length > 0 && <Row title="Binge-Worthy TV Shows" items={data.tv} />}
        {data.action.length > 0 && <Row title="Action & Thrillers" items={data.action} />}
        {data.newTv.length > 0 && <Row title="Top Rated TV Series" items={data.newTv} />}
      </div>

      <SportsRow />
    </motion.div>
  );
};

export default Home;
