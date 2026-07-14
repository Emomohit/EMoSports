import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  return (
    <div className="content-pad" style={{ paddingTop: '2rem' }}>
      <div style={{
        position: 'relative',
        maxWidth: '800px',
        margin: '0 auto 4rem auto'
      }}>
        <SearchIcon 
          size={28} 
          style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
        />
        <input 
          type="text" 
          placeholder="Movies, shows and more"
          style={{
            width: '100%',
            padding: '20px 20px 20px 65px',
            fontSize: '1.5rem',
            background: 'var(--bg-card)',
            border: '2px solid transparent',
            borderRadius: '12px',
            color: 'white',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'transparent'}
        />
      </div>
      
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Trending Searches</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {['Cricket World Cup', 'Premier League', 'News 24', 'F1 Highlights', 'Tennis Grand Slam'].map(tag => (
          <div key={tag} style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}
