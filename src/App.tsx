import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Player from './pages/Player';
import MySpace from './pages/MySpace';
import Search from './pages/Search';
import CategoryPage from './pages/CategoryPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Player />} />
          <Route path="/myspace" element={<MySpace />} />
          <Route path="/search" element={<Search />} />
          <Route path="/sports" element={<CategoryPage title="Live Sports" categoryFilter="sports" />} />
          <Route path="/livetv" element={<CategoryPage title="Live TV (All)" />} />
          <Route path="/movies" element={<CategoryPage title="Movies" categoryFilter="movies" />} />
          <Route path="/explore" element={<CategoryPage title="Explore Channels" />} />
          <Route path="*" element={
            <div className="content-pad" style={{ textAlign: 'center', paddingTop: '10vh' }}>
              <h2>Page Not Found or Under Construction 🚧</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Try going to Home or clicking a video.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
