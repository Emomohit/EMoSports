import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLiveChannels, type LiveStream } from '../api/liveData';

interface CategoryPageProps {
  title: string;
  categoryFilter?: string; // 'sports', 'news', 'movies'
}

export default function CategoryPage({ title, categoryFilter }: CategoryPageProps) {
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const allChannels = await fetchLiveChannels();
      if (categoryFilter) {
        setChannels(allChannels.filter(c => c.category?.toLowerCase() === categoryFilter.toLowerCase()));
      } else {
        setChannels(allChannels); // show all
      }
      setLoading(false);
    };
    loadData();
  }, [categoryFilter]);

  return (
    <div className="content-pad" style={{ paddingTop: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>{title}</h1>
      
      {loading ? (
        <p>Loading live streams...</p>
      ) : channels.length === 0 ? (
        <p>No streams currently broadcasting in this category.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {channels.map(channel => (
            <Link to={`/watch/${channel.id}`} key={channel.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                aspectRatio: '16/9'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={channel.image} alt={channel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '4px', display: 'block' }}>● LIVE</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
