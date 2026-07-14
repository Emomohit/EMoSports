import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { LIVE_CHANNELS, MATCH_HIGHLIGHTS } from '../api/mockData';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="content-pad">
        <Carousel title="Live Channels" items={LIVE_CHANNELS} />
        <Carousel title="Match Highlights" items={MATCH_HIGHLIGHTS} />
      </div>
    </>
  );
}
