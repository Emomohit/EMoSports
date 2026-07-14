import { Play, Plus } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <div className="hero-container">
      <div className="hero-overlay"></div>
      <img 
        src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
        alt="Cricket Stadium" 
        className="hero-image"
      />
      
      <div className="hero-content">
        <div className="live-badge">
          <span className="live-dot"></span>
          LIVE
        </div>
        <h1 className="hero-title">ICC Men's T20 World Cup</h1>
        <h2 className="hero-subtitle">India vs Pakistan - Final</h2>
        <p className="hero-desc">
          Watch the ultimate rivalry unfold as the two cricketing giants clash in the final showdown at the MCG. 
          Catch every ball, every boundary, live in 4K.
        </p>
        
        <div className="hero-actions">
          <button className="btn-primary">
            <Play size={20} fill="currentColor" />
            <span>Watch Now</span>
          </button>
          <button className="btn-secondary glass">
            <Plus size={20} />
            <span>Watchlist</span>
          </button>
        </div>
      </div>
    </div>
  );
}
