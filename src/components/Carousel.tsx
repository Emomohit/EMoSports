import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import './Carousel.css';

interface CarouselItem {
  id: string;
  title: string;
  image: string;
  type?: string;
}

interface CarouselProps {
  title: string;
  items: CarouselItem[];
}

export default function Carousel({ title, items }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth + 50 : current.offsetWidth - 50;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-section">
      <h3 className="carousel-title">{title}</h3>
      <div className="carousel-container">
        <button className="scroll-btn left" onClick={() => scroll('left')}>
          <ChevronLeft size={24} />
        </button>
        
        <div className="carousel-track" ref={scrollRef}>
          {items.map((item) => (
            <div key={item.id} className={`carousel-card ${item.type || 'highlight'}`}>
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="card-overlay">
                <span className="card-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="scroll-btn right" onClick={() => scroll('right')}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
