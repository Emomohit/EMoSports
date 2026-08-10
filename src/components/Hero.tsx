import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Play, Info } from 'lucide-react';

interface HeroProps {
  slides: any[];
}

const Hero: React.FC<HeroProps> = ({ slides }) => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Auto-slide
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [slides]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    // Normalize coordinates to -1 -> 1
    const x = ((e.clientX - left) / width - 0.5) * 2;
    const y = ((e.clientY - top) / height - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Compute Parallax transforms
  const bgTranslateX = useTransform(mouseX, [-1, 1], [15, -15]);
  const bgTranslateY = useTransform(mouseY, [-1, 1], [15, -15]);
  
  const contentRotateX = useTransform(mouseY, [-1, 1], [4, -4]);
  const contentRotateY = useTransform(mouseX, [-1, 1], [-4, 4]);
  const contentTranslateX = useTransform(mouseX, [-1, 1], [-15, 15]);
  const contentTranslateY = useTransform(mouseY, [-1, 1], [-15, 15]);

  if (!slides || slides.length === 0) return null;
  const current = slides[index];

  return (
    <div 
      className="relative h-[68vh] md:h-[75vh] min-h-[480px] overflow-hidden"
      style={{ perspective: 1200 }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-end px-[5%] pb-[6%]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Background Layer with Parallax */}
          <motion.div 
            className="absolute -inset-[4%] bg-cover bg-center filter brightness-110 contrast-105"
            style={{ 
              backgroundImage: `url(${current.backdrop})`,
              x: bgTranslateX,
              y: bgTranslateY,
              scale: 1.02
            }}
          />
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

          {/* Content Layer with 3D Tilt */}
          <motion.div 
            className="relative z-30 max-w-[620px] text-white"
            style={{
              rotateX: contentRotateX,
              rotateY: contentRotateY,
              x: contentTranslateX,
              y: contentTranslateY,
              z: 60,
              textShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}
          >
            <div className="text-[12px] font-semibold text-[#98989d] tracking-widest uppercase mb-3 drop-shadow-md">
              emoplay Premium
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-3 drop-shadow-2xl">
              {current.title}
            </h1>
            
            <div className="flex items-center gap-2.5 mb-4 text-[13.5px] font-medium text-white/90">
              <span>{current.year}</span>
              <span className="w-1 h-1 rounded-full bg-[#0a84ff] shadow-[0_0_8px_#0a84ff]" />
              <span>{current.rating}</span>
              <span className="w-1 h-1 rounded-full bg-[#0a84ff] shadow-[0_0_8px_#0a84ff]" />
              <span>HD</span>
            </div>
            
            <p className="text-sm sm:text-[16.5px] text-[#e0e0e0] leading-relaxed mb-5 sm:mb-8 max-w-[500px] font-medium line-clamp-3 md:line-clamp-none">
              {current.desc.length > 150 ? current.desc.substring(0, 150) + '...' : current.desc}
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('playMedia', { detail: current }))}
                className="flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white text-black rounded-full font-bold text-sm sm:text-[15px] transition-all duration-300 hover:scale-105 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                Play
              </button>
              
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openModal', { detail: current }))}
                className="flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white/10 text-white rounded-full font-bold text-sm sm:text-[15px] transition-all duration-300 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 hover:border-white/40 shadow-lg active:scale-95"
              >
                <Info className="w-4 h-4" />
                More Info
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute right-4 sm:right-[5%] bottom-4 sm:bottom-[11%] flex gap-2 z-30">
        {slides.map((_, i) => (
          <div 
            key={i}
            onClick={() => setIndex(i)}
            className={`h-[3px] rounded-full cursor-pointer transition-all duration-400 ${i === index ? 'w-[35px] bg-[#0a84ff] shadow-[0_0_10px_#0a84ff]' : 'w-[20px] bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
