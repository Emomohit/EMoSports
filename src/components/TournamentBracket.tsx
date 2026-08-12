import React, { useState } from 'react';
import { Trophy, Swords } from 'lucide-react';
import { motion } from 'framer-motion';

interface Matchup {
  id: string;
  round: 'Quarter-Finals' | 'Semi-Finals' | 'Grand-Final';
  team1: { name: string; flag: string; score: string; winner?: boolean };
  team2: { name: string; flag: string; score: string; winner?: boolean };
  live?: boolean;
}

const BRACKET_DATA: Matchup[] = [
  // Quarter Finals
  { id: 'qf-1', round: 'Quarter-Finals', team1: { name: 'India', flag: '🇮🇳', score: '3', winner: true }, team2: { name: 'Australia', flag: '🇦🇺', score: '1' } },
  { id: 'qf-2', round: 'Quarter-Finals', team1: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', score: '2', winner: true }, team2: { name: 'New Zealand', flag: '🇳🇿', score: '0' } },
  { id: 'qf-3', round: 'Quarter-Finals', team1: { name: 'South Africa', flag: '🇿🇦', score: '3', winner: true }, team2: { name: 'Pakistan', flag: '🇵🇰', score: '2' } },
  { id: 'qf-4', round: 'Quarter-Finals', team1: { name: 'West Indies', flag: '🌴', score: '1' }, team2: { name: 'Sri Lanka', flag: '🇱🇰', score: '3', winner: true } },

  // Semi Finals
  { id: 'sf-1', round: 'Semi-Finals', team1: { name: 'India', flag: '🇮🇳', score: '171/7', winner: true }, team2: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', score: '103' }, live: true },
  { id: 'sf-2', round: 'Semi-Finals', team1: { name: 'South Africa', flag: '🇿🇦', score: '60/1', winner: true }, team2: { name: 'Sri Lanka', flag: '🇱🇰', score: '56' } },

  // Grand Final
  { id: 'gf-1', round: 'Grand-Final', team1: { name: 'India', flag: '🇮🇳', score: '176/7', winner: true }, team2: { name: 'South Africa', flag: '🇿🇦', score: '169/8' }, live: true },
];

const TournamentBracket: React.FC = () => {
  const [selectedRound, setSelectedRound] = useState<'All' | 'Quarter-Finals' | 'Semi-Finals' | 'Grand-Final'>('All');

  const filtered = selectedRound === 'All' ? BRACKET_DATA : BRACKET_DATA.filter((m) => m.round === selectedRound);

  return (
    <div className="px-[5%] mb-16 relative z-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[#0a84ff] uppercase mb-1">
            <Trophy className="w-4 h-4 text-[#ffcc00]" /> World Championship Finals
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Knockout Stage Bracket
          </h2>
        </div>

        {/* Round Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {(['All', 'Quarter-Finals', 'Semi-Finals', 'Grand-Final'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedRound === r
                  ? 'bg-[#0a84ff] text-white shadow-[0_0_20px_rgba(10,132,255,0.4)] scale-105'
                  : 'bg-white/5 text-[#98989d] hover:bg-white/10 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Bracket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="relative rounded-2xl bg-[#141417]/90 border border-white/10 p-5 shadow-xl backdrop-blur-md overflow-hidden group"
          >
            {/* Live Indicator Badge */}
            {match.live && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-600/90 text-white text-[10px] font-black rounded-full tracking-wider uppercase shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE
              </div>
            )}

            <div className="text-[11px] font-bold text-[#98989d] uppercase tracking-wider mb-4 flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-[#0a84ff]" /> {match.round}
            </div>

            {/* Team 1 */}
            <div className={`flex items-center justify-between p-3 rounded-xl mb-2.5 transition-colors ${match.team1.winner ? 'bg-white/10 border border-white/20' : 'bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{match.team1.flag}</span>
                <span className="text-sm font-bold text-white">{match.team1.name}</span>
              </div>
              <span className={`text-sm font-black ${match.team1.winner ? 'text-[#30d158]' : 'text-[#98989d]'}`}>
                {match.team1.score}
              </span>
            </div>

            {/* Team 2 */}
            <div className={`flex items-center justify-between p-3 rounded-xl transition-colors ${match.team2.winner ? 'bg-white/10 border border-white/20' : 'bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{match.team2.flag}</span>
                <span className="text-sm font-bold text-white">{match.team2.name}</span>
              </div>
              <span className={`text-sm font-black ${match.team2.winner ? 'text-[#30d158]' : 'text-[#98989d]'}`}>
                {match.team2.score}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;
