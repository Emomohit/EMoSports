import React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface CardProps {
  item: any;
  rank?: number;
}

const Card: React.FC<CardProps> = ({ item, rank = 0 }) => {
  const { myListIds, toggleMyList } = useAppContext();
  const isInList = myListIds.has(item.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('playMedia', { detail: item }));
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMyList(item.id);
  };

  const handleInfo = () => {
    window.dispatchEvent(new CustomEvent('openModal', { detail: item }));
  };

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${rank > 0 ? 'w-[165px] sm:w-[210px] md:w-[250px]' : 'w-[155px] sm:w-[190px] md:w-[230px] lg:w-[260px]'} rounded-xl`}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      onClick={handleInfo}
    >
      <motion.div 
        whileHover={{ 
          y: -15, 
          scale: 1.08, 
          rotateX: 4, 
          rotateY: -4,
          boxShadow: "20px 20px 30px rgba(0,0,0,0.6), -5px -5px 20px rgba(255,255,255,0.08)",
          zIndex: 10
        }}
        className="relative group rounded-xl bg-[#222]"
      >
        {rank > 0 && (
          <div className="absolute -left-3 sm:-left-5 -bottom-2 text-[75px] sm:text-[100px] md:text-[120px] font-black leading-none text-black z-20 pointer-events-none select-none" style={{ WebkitTextStroke: '2px #444' }}>
            {rank}
          </div>
        )}
        
        <div className="w-full aspect-[16/9.4] rounded-xl overflow-hidden relative">
          <img 
            src={item.poster || item.backdrop} 
            alt={item.title} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105 filter contrast-110 saturate-110" 
          />
          
          {/* Glass Glare Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10" />
          
          {/* Play Icon Glass */}
          <div 
            onClick={handlePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110 z-20 border border-white/20"
          >
            <Play className="w-5 h-5 fill-white text-white" />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-xl z-10">
          <div className="text-white font-bold text-lg mb-1 truncate">{item.title}</div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#0a84ff] font-semibold">{item.match || '90% Match'}</span>
            <span className="text-white/70">{item.year}</span>
          </div>
        </div>

        <button 
          onClick={handleAdd}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:scale-110 transition-all z-20 text-white"
        >
          {isInList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </motion.div>
    </div>
  );
};

export default Card;
