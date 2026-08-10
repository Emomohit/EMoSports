import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import VideoPlayer from './components/VideoPlayer';
import Modal from './components/Modal';

import Home from './pages/Home';
import Movies from './pages/Movies';
import Shows from './pages/Shows';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <Loader />
      <Navbar />
      <AnimatedRoutes />
      <VideoPlayer />
      <Modal />
    </Router>
  );
}

export default App;
