import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { getStreamById } from '../api/mockData';
import { ArrowLeft } from 'lucide-react';
import './Player.css';

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const content = id ? getStreamById(id) : null;

  useEffect(() => {
    if (!content) {
      setError('Content not found!');
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
      });

      hls.loadSource(content.streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('Autoplay blocked:', e));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Failed to load the stream. Please try again later.');
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = content.streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('Autoplay blocked:', e));
      });
    }
  }, [content]);

  if (error) {
    return (
      <div className="player-error">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft /> Back</button>
        <h2>{error}</h2>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="player-container">
      <button className="back-btn overlay" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
      </button>
      
      <div className="video-wrapper">
        <video 
          ref={videoRef} 
          className="hls-video" 
          controls 
          autoPlay 
          playsInline
        />
      </div>
      
      <div className="player-details">
        <h1 className="player-title">{content.title}</h1>
        <p className="player-desc">Live streaming powered by HLS.js. This is a premium quality test stream ensuring maximum compatibility across all devices and networks.</p>
      </div>
    </div>
  );
}
