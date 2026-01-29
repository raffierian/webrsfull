import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const defaultSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&h=1080&fit=crop',
    badge: '🏥 Rumah Sakit Terbaik',
    title: 'Pelayanan Kesehatan',
    titleHighlight: 'Berkualitas Internasional',
    subtitle: 'Memberikan pelayanan kesehatan terbaik dengan tenaga medis profesional dan fasilitas modern untuk kesehatan Anda dan keluarga.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1920&h=1080&fit=crop',
    badge: '⚕️ Fasilitas Modern',
    title: 'Teknologi Medis',
    titleHighlight: 'Terdepan & Canggih',
    subtitle: 'Dilengkapi peralatan medis terkini dan sistem informasi terintegrasi untuk diagnosis dan perawatan yang lebih akurat.',
  },
];

const HeroCarousel: React.FC = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch Slides
  const { data: heroData } = useQuery({
    queryKey: ['homepage-hero'],
    queryFn: () => api.homepage.getSection('hero'),
  });

  const slides = (heroData?.content && Array.isArray(heroData.content) && heroData.content.length > 0)
    ? heroData.content
    : defaultSlides;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10 min-h-[90vh] flex items-center">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                {slides[currentSlide].badge}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 md:mb-6">
                {slides[currentSlide].title}
                <br />
                <span className="text-white/90">{slides[currentSlide].titleHighlight}</span>
              </h1>
              <p className="text-base md:text-lg text-white/80 mb-6 md:mb-8 leading-relaxed max-w-xl">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/appointment" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="gap-2 w-full">
                <Calendar className="w-5 h-5" />
                {t('hero.cta1')}
              </Button>
            </Link>
            <Link to="/consultation" className="w-full sm:w-auto">
              <Button variant="heroOutline" size="xl" className="gap-2 w-full">
                <MessageCircle className="w-5 h-5" />
                {t('hero.cta2')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => { prevSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => { nextSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
              ? 'w-8 bg-white'
              : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <motion.div
          key={currentSlide}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          className="h-full bg-white"
        />
      </div>
    </section>
  );
};

export default HeroCarousel;
