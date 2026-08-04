import { useState } from 'react';
import { Play, Activity, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SportsMatch {
  id: string;
  title: string;
  category: 'Cricket' | 'Football' | 'F1' | 'Basketball';
  team1: { name: string; flag: string; score?: string };
  team2: { name: string; flag: string; score?: string };
  status: 'LIVE' | 'UPCOMING' | 'HIGHLIGHTS';
  timeOrPeriod: string;
  thumbnail: string;
  videoUrl: string;
}

const LIVE_SPORTS_DATA: SportsMatch[] = [
  {
    id: 'match-1',
    title: 'ICC T20 World Cup Final',
    category: 'Cricket',
    team1: { name: 'India', flag: '🇮🇳', score: '176/7 (20.0)' },
    team2: { name: 'South Africa', flag: '🇿🇦', score: '169/8 (20.0)' },
    status: 'LIVE',
    timeOrPeriod: 'Final Over · Need 16 off 6',
    thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
  {
    id: 'match-2',
    title: 'UEFA Champions League Final',
    category: 'Football',
    team1: { name: 'Real Madrid', flag: '🇪🇸', score: '2' },
    team2: { name: 'Borussia Dortmund', flag: '🇩🇪', score: '0' },
    status: 'LIVE',
    timeOrPeriod: '88th Minute',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'match-3',
    title: 'Monaco Grand Prix 2026',
    category: 'F1',
    team1: { name: 'Verstappen (Red Bull)', flag: '🇳🇱', score: 'P1' },
    team2: { name: 'Leclerc (Ferrari)', flag: '🇲🇨', score: '+1.2s' },
    status: 'LIVE',
    timeOrPeriod: 'Lap 62 / 78',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'match-4',
    title: 'NBA Finals Game 7',
    category: 'Basketball',
    team1: { name: 'Lakers', flag: '🇺🇸', score: '108' },
    team2: { name: 'Celtics', flag: '🇺🇸', score: '104' },
    status: 'HIGHLIGHTS',
    timeOrPeriod: 'Final Score',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
];

export default function SportsRow() {
  const [selectedMatch, setSelectedMatch] = useState<SportsMatch | null>(null);

  return (
    <div className="my-10 px-4 md:px-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              EMoSports <span className="text-red-500 uppercase font-black text-sm px-2 py-0.5 rounded border border-red-500/40 bg-red-500/10">LIVE NOW</span>
            </h2>
            <p className="text-xs text-gray-400">Stream high-definition live sports & tournament broadcasts</p>
          </div>
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {LIVE_SPORTS_DATA.map((match) => (
          <motion.div
            key={match.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelectedMatch(match)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-md transition-all hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={match.thumbnail}
                alt={match.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-600/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                {match.status}
              </div>

              <div className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 backdrop-blur-md">
                {match.category}
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            {/* Score & Match Title */}
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                {match.title}
              </h3>

              <div className="flex items-center justify-between text-xs font-mono font-semibold bg-neutral-950/80 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span>{match.team1.flag}</span>
                  <span className="text-gray-200">{match.team1.name}</span>
                </div>
                <span className="text-red-400 font-extrabold">{match.team1.score}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-semibold bg-neutral-950/80 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span>{match.team2.flag}</span>
                  <span className="text-gray-200">{match.team2.name}</span>
                </div>
                <span className="text-red-400 font-extrabold">{match.team2.score}</span>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <Activity className="h-3 w-3" /> {match.timeOrPeriod}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Stream Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-red-500/40 bg-neutral-950 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-600 px-3 py-0.5 text-xs font-black text-white">LIVE</span>
                  <h3 className="font-bold text-white text-lg">{selectedMatch.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold text-gray-400 hover:text-white hover:border-white transition-colors"
                >
                  ✕ Close Stream
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <video
                  src={selectedMatch.videoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
