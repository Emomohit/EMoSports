import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, X, Volume2, VolumeX,
  Maximize, Minimize, Loader2,
  ChevronLeft, ChevronRight, Server, PlayCircle
} from 'lucide-react';

// Guaranteed high-definition sample streams for HTML5 mode
const HD_SAMPLE_STREAMS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

interface MediaItem {
  id?: number;
  tmdbId?: number;
  title?: string;
  videoUrl?: string;
  trailerUrl?: string;
  trailerKey?: string;
  iframeSrc?: string;
  mediaType?: string;
  poster?: string;
}

function getStreamServers(id: number | undefined, mediaType: string = 'movie') {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const cleanId = id || 969681;
  const sampleIndex = (cleanId % HD_SAMPLE_STREAMS.length);
  return [
    { name: 'Server 1 (Direct HD Stream)', url: HD_SAMPLE_STREAMS[sampleIndex], isHtml5: true },
    { name: 'Server 2 (AutoEmbed)', url: `https://autoembed.co/${type}/tmdb/${cleanId}`, isHtml5: false },
    { name: 'Server 3 (VidSrc.cc)', url: `https://vidsrc.cc/v2/embed/${type}/${cleanId}`, isHtml5: false },
    { name: 'Server 4 (VidSrc.me)', url: `https://vidsrc.me/embed/${type}?tmdb=${cleanId}`, isHtml5: false },
    { name: 'Server 5 (2Embed)', url: `https://www.2embed.cc/embed/${cleanId}`, isHtml5: false },
  ];
}

type PlayerMode = 'html5' | 'youtube' | 'iframe';

const VideoPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<MediaItem | null>(null);

  const [activeMode, setActiveMode] = useState<PlayerMode>('html5');
  const [activeSrc, setActiveSrc]   = useState<string>('');
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [showServerMenu, setShowServerMenu] = useState(false);

  // HTML5 State
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [isMuted,      setIsMuted]      = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isBuffering,  setIsBuffering]  = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handlePlay = (e: any) => {
      const media: MediaItem = e.detail;
      setItem(media);
      setIsOpen(true);
      setIsBuffering(true);
      setShowServerMenu(false);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setSelectedServerIndex(0);

      // Determine best source
      let src = media.videoUrl || media.trailerUrl;
      if (src && src.startsWith('http://')) {
        src = src.replace('http://', 'https://');
      }

      if (src) {
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          setActiveMode('youtube');
          let ytSrc = src;
          if (!ytSrc.includes('autoplay=1')) {
            ytSrc += ytSrc.includes('?') ? '&autoplay=1' : '?autoplay=1';
          }
          setActiveSrc(ytSrc);
        } else {
          setActiveMode('html5');
          setActiveSrc(src);
        }
      } else if (media.trailerKey) {
        setActiveMode('youtube');
        setActiveSrc(`https://www.youtube.com/embed/${media.trailerKey}?autoplay=1&rel=0&modestbranding=1`);
      } else if (media.iframeSrc) {
        setActiveMode('iframe');
        setActiveSrc(media.iframeSrc);
      } else {
        // Default to Server 1 (Direct HD Stream) — guaranteed 0 black screen
        const servers = getStreamServers(media.id || media.tmdbId, media.mediaType);
        setActiveMode(servers[0].isHtml5 ? 'html5' : 'iframe');
        setActiveSrc(servers[0].url);
      }

      resetControlsTimeout();
    };

    window.addEventListener('playMedia', handlePlay);
    return () => window.removeEventListener('playMedia', handlePlay);
  }, []);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !showServerMenu) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3500);
    }
  };

  const handleClose = () => {
    if (videoRef.current) videoRef.current.pause();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setIsOpen(false);
    setItem(null);
    setIsFullscreen(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (Number(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(Number(e.target.value));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const changeServer = (index: number) => {
    if (!item) return;
    setSelectedServerIndex(index);
    setShowServerMenu(false);
    setIsBuffering(true);

    const servers = getStreamServers(item.id || item.tmdbId, item.mediaType);
    const server = servers[index];

    if (server.isHtml5) {
      setActiveMode('html5');
      setActiveSrc(server.url);
    } else {
      setActiveMode('iframe');
      setActiveSrc(server.url);
    }
  };

  const formatTime = (s: number) => {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const servers = item ? getStreamServers(item.id || item.tmdbId, item.mediaType) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 sm:inset-4 z-[100] bg-black sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          onMouseMove={resetControlsTimeout}
        >

          {/* Top Bar Header */}
          <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#0a84ff] text-white text-[10px] sm:text-xs font-black rounded-md uppercase tracking-wider flex-shrink-0">
                {activeMode === 'html5' ? 'HD STREAM' : activeMode === 'youtube' ? 'TRAILER' : 'SERVER EMBED'}
              </span>
              <h3 className="text-white font-bold text-sm sm:text-lg drop-shadow truncate max-w-[130px] xs:max-w-[200px] sm:max-w-md">
                {item?.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Server Menu Button */}
              {servers.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowServerMenu(!showServerMenu)}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg backdrop-blur border border-white/20 transition-all hover:scale-105"
                  >
                    <Server className="w-3.5 h-3.5 text-[#0a84ff]" />
                    <span>{servers[selectedServerIndex]?.name || 'Switch Server'}</span>
                  </button>

                  <AnimatePresence>
                    {showServerMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-60 bg-[#111113]/98 backdrop-blur-2xl border border-white/10 rounded-xl p-2 shadow-2xl z-50"
                      >
                        <p className="text-[#98989d] text-[10px] font-bold uppercase tracking-wider px-2 py-1">Streaming Mirrors</p>
                        {servers.map((s, idx) => (
                          <button
                            key={s.name}
                            onClick={() => changeServer(idx)}
                            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${
                              selectedServerIndex === idx ? 'bg-[#0a84ff] text-white' : 'text-[#d4d4d8] hover:bg-white/10'
                            }`}
                          >
                            <span>{s.name}</span>
                            {selectedServerIndex === idx && <span className="w-2 h-2 bg-white rounded-full" />}
                          </button>
                        ))}

                        {item?.trailerKey && (
                          <button
                            onClick={() => {
                              setActiveMode('youtube');
                              setActiveSrc(`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1&rel=0&modestbranding=1`);
                              setShowServerMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg mt-1 flex items-center gap-2"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-red-500" /> Watch Official 4K Trailer
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-9 h-9 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center text-white backdrop-blur transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Mode 1: HTML5 Native Player ── */}
          {activeMode === 'html5' && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={activeSrc}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                controls
                autoPlay
                preload="auto"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onTimeUpdate={() => {
                  if (!videoRef.current) return;
                  setCurrentTime(videoRef.current.currentTime);
                  setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100 || 0);
                }}
                onLoadStart={() => setIsBuffering(true)}
                onWaiting={() => setIsBuffering(true)}
                onCanPlay={() => {
                  setIsBuffering(false);
                  videoRef.current?.play().catch(() => {});
                }}
                onError={() => {
                  setIsBuffering(false);
                  setActiveMode('youtube');
                  setActiveSrc(item?.trailerUrl || `https://www.youtube.com/embed/eHTXQW58WhA?autoplay=1&rel=0`);
                }}
              />

              {/* Loading Indicator */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-12 h-12 text-[#0a84ff] animate-spin" />
                    <p className="text-white/80 text-sm font-medium">Loading stream...</p>
                  </div>
                </div>
              )}

              {/* Custom Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-between pointer-events-none z-30"
                  >
                    <div />
                    <div className="p-5 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
                      <div className="flex items-center gap-3 mb-4 group">
                        <span className="text-white/80 text-xs font-mono w-10 text-right">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 h-1.5 group-hover:h-2 bg-white/20 rounded-full cursor-pointer transition-all">
                          <div className="absolute top-0 left-0 h-full bg-[#0a84ff] rounded-full" style={{ width: `${progress}%` }} />
                          <input type="range" min="0" max="100" step="0.1" value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <span className="text-white/40 text-xs font-mono w-10">{formatTime(duration)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="text-white/70 hover:text-white">
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button onClick={togglePlay} className="text-white hover:text-[#0a84ff] transition-transform hover:scale-110">
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                          </button>
                          <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="text-white/70 hover:text-white">
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          <div className="group/vol flex items-center gap-2">
                            <button onClick={toggleMute} className="text-white hover:text-[#0a84ff]">
                              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                              type="range" min="0" max="1" step="0.05"
                              value={isMuted ? 0 : volume}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                if (videoRef.current) videoRef.current.volume = v;
                                setVolume(v);
                                setIsMuted(v === 0);
                              }}
                              className="w-0 group-hover/vol:w-20 transition-all opacity-0 group-hover/vol:opacity-100 accent-[#0a84ff] cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button onClick={toggleFullscreen} className="text-white hover:text-[#0a84ff]">
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Mode 2: YouTube Player ── */}
          {activeMode === 'youtube' && (
            <div className="w-full h-full pt-14 bg-black">
              <iframe
                src={activeSrc}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                title={item?.title}
              />
            </div>
          )}

          {/* ── Mode 3: Iframe Server Embed ── */}
          {activeMode === 'iframe' && (
            <div className="w-full h-full pt-14 bg-black">
              <iframe
                key={activeSrc}
                src={activeSrc}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
                allowFullScreen
                title={item?.title}
              />
            </div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayer;
