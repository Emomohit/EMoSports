import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { fetchLiveChannels, type LiveStream } from '../api/liveData';

export default function Home() {
  const [sportsChannels, setSportsChannels] = useState<LiveStream[]>([]);
  const [newsChannels, setNewsChannels] = useState<LiveStream[]>([]);

  useEffect(() => {
    const loadChannels = async () => {
      const allChannels = await fetchLiveChannels();
      setSportsChannels(allChannels.filter(c => c.category?.toLowerCase() === 'sports').slice(0, 15));
      setNewsChannels(allChannels.filter(c => c.category?.toLowerCase() === 'news').slice(0, 15));
    };
    loadChannels();
  }, []);

  return (
    <>
      <Hero />
      <div className="content-pad">
        <Carousel title="Live Sports Networks" items={sportsChannels.length > 0 ? sportsChannels : []} />
        <Carousel title="Global News" items={newsChannels.length > 0 ? newsChannels : []} />
      </div>
    </>
  );
}
