import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import LegacyEmoplay from './components/LegacyEmoplay';

function App() {
  return (
    <>
      <Loader />
      <Navbar />
      <LegacyEmoplay />
      <Footer />
    </>
  );
}

export default App;
