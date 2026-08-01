import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import Card from './Card';

interface RowProps {
  title: string;
  items: any[];
  isRanked?: boolean;
}

const Row: React.FC<RowProps> = ({ title, items, isRanked = false }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="mb-16 relative z-10"
    >
      <h2 className="text-[13px] font-semibold px-[5%] pb-5 tracking-[0.06em] uppercase text-[#98989d]">
        {title}
      </h2>
      
      <div className="px-[5%] relative">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={20}
          slidesPerView="auto"
          freeMode={true}
          navigation
          className="!overflow-visible"
        >
          {items.map((item, idx) => (
            <SwiperSlide key={item.id} className="!w-auto">
              <Card item={item} rank={isRanked ? idx + 1 : 0} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </motion.div>
  );
};

export default Row;
