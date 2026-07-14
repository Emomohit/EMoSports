import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Player from './pages/Player';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Player />} />
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
