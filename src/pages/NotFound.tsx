import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/80" />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-[120px] font-black text-white leading-none tracking-tighter drop-shadow-2xl">404</h1>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Lost your way?</h2>
        <p className="text-lg text-[#98989d] max-w-md mx-auto mb-10">
          Sorry, we can't find that page. You'll find loads to explore on the home page.
        </p>
        <Link 
          to="/" 
          className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-xl"
        >
          emoplay Home
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NotFound;
