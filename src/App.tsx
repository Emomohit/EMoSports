import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Carousel from './components/Carousel';
import './App.css';

// Mock Data
const LIVE_CHANNELS = [
  { id: '1', title: 'Star Sports 1', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=300&q=80', type: 'channel' },
  { id: '2', title: 'Sony Ten 1', image: 'https://images.unsplash.com/photo-1541252876127-6f8c7e098485?w=300&q=80', type: 'channel' },
  { id: '3', title: 'Willow TV', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&q=80', type: 'channel' },
  { id: '4', title: 'Sky Sports', image: 'https://images.unsplash.com/photo-1521731978258-2921a97d9193?w=300&q=80', type: 'channel' },
  { id: '5', title: 'Fox Sports', image: 'https://images.unsplash.com/photo-1518605368461-1ee7c631e840?w=300&q=80', type: 'channel' },
  { id: '6', title: 'ESPN', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80', type: 'channel' },
  { id: '7', title: 'BT Sport', image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&q=80', type: 'channel' },
];

const MATCH_HIGHLIGHTS = [
  { id: '10', title: 'Kohli 82* vs Pakistan - Thriller Finish', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=80' },
  { id: '11', title: 'Messi Magic in World Cup Final', image: 'https://images.unsplash.com/photo-1518605368461-1ee7c631e840?w=500&q=80' },
  { id: '12', title: 'Djokovic Wins 24th Grand Slam', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&q=80' },
  { id: '13', title: 'Lakers vs Warriors - Full Highlights', image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&q=80' },
  { id: '14', title: 'F1 Abu Dhabi Grand Prix Final Lap', image: 'https://images.unsplash.com/photo-1501430654243-c934cec2e1c0?w=500&q=80' },
];

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Hero />
        
        <div className="content-pad">
          <Carousel title="Live Channels" items={LIVE_CHANNELS} />
          <Carousel title="Match Highlights" items={MATCH_HIGHLIGHTS} />
        </div>
      </main>
    </div>
  );
}

export default App;
