import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeroVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  maker_name: string;
  location: string;
  order_index: number;
}

// Helper for animated heading (letter-by-letter)
const AnimatedHeading: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="inline-block">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

export const VideoCarousel: React.FC = () => {
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Parallax: background moves slower and zooms in
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  // Overlay fades in
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 0.7, 0.7]);
  // Content slides up and fades in
  const contentY = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1]);

  useEffect(() => {
    fetchHeroVideos();
  }, []);

  const fetchHeroVideos = async () => {
    try {
      console.log('Fetching hero videos...');
      const { data, error } = await supabase
        .from('hero_videos')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) {
        console.error('Error fetching hero videos:', error);
        console.warn('Using fallback hero content');
        return;
      }

      if (data && data.length > 0) {
        console.log('Hero videos loaded:', data.length);
        setVideos(data);
      }
    } catch (error) {
      console.error('Error in fetchHeroVideos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (videos.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % videos.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [videos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[340px] md:h-[420px] lg:h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="relative w-full h-[340px] md:h-[420px] lg:h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center">
        <div className="text-center text-orange-700">
          <h2 className="text-2xl font-bold mb-2">No videos available</h2>
          <p>Admin needs to add hero videos</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="relative w-full h-[340px] md:h-[420px] lg:h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden"
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image with Parallax and Zoom */}
          <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
            <img
              src={videos[currentSlide].video_url}
              alt={videos[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <motion.div className="absolute inset-0 bg-black/70" style={{ opacity: overlayOpacity }} />
          </motion.div>

          {/* Content Overlay with Parallax and Animated Heading */}
          <div
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ y: contentY, opacity: contentOpacity }}
          >
            <div className="text-center text-white max-w-2xl mx-auto px-4">
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight drop-shadow-lg whitespace-nowrap">
                Every Gift Has a <span className="text-blush-400">Story</span>
              </h1>
              <h2 className="text-base md:text-2xl lg:text-3xl mb-4 font-light">
                Meet the Makers
              </h2>
              <div className="mb-4">
                <p className="text-base md:text-lg mb-1">{videos[currentSlide].description}</p>
                <p className="text-amber-200 text-sm md:text-base">
                  by {videos[currentSlide].maker_name} • {videos[currentSlide].location}
                </p>
              </div>
              <button
                onClick={scrollToProducts}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full text-base md:text-lg font-semibold transition-all duration-300 inline-flex items-center space-x-2 shadow-lg"
              >
                <span>Explore Their Creations</span>
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {videos.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};