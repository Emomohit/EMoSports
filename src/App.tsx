import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import VideoPlayer from './components/VideoPlayer';
import LegacyEmoplay from './components/LegacyEmoplay';

function App() {
  return (
    <>
      <Loader />
      <Navbar />
      <LegacyEmoplay />
      <VideoPlayer />
      <Footer />
    </>
  );
}

export default App;
