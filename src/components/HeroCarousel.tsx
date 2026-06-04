import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteSettings } from '../utils/siteSettings';
import { BRAND_NAME } from '../brand';

export default function HeroCarousel() {
  const heroSlides = useSiteSettings((s) => s.heroSlides);
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    const t = window.setInterval(next, 6000);
    return () => window.clearInterval(t);
  }, [next]);

  const slide = heroSlides[index];

  return (
    <section className="relative w-full bg-[#ebebeb] dark:bg-zinc-900">
      <div className="relative aspect-[2.2/1] min-h-[320px] sm:min-h-[380px] md:min-h-[480px] lg:min-h-[520px] max-h-[680px]">
        <AnimatePresence mode="wait">
          <motion.a
            key={slide.id}
            href={slide.href}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 block"
          >
            <img
              src={slide.image}
              alt={slide.imageAlt ?? slide.title}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12">
              <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.35em] text-white/90 mb-3 md:mb-4">
                {BRAND_NAME} · Made to order
              </p>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-white uppercase tracking-[0.06em] leading-[1.1] max-w-4xl">
                {slide.title}
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/85 max-w-md font-normal tracking-wide">
                {slide.subtitle}
              </p>
              <span className="mt-8 md:mt-10 inline-flex items-center justify-center min-w-[180px] px-10 py-3.5 bg-white text-[#111] text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-white/90 transition-colors">
                {slide.cta}
              </span>
            </div>
          </motion.a>
        </AnimatePresence>

        <button
          type="button"
          onClick={prev}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/90 hover:text-white z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="w-7 h-7" strokeWidth={1.25} />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/90 hover:text-white z-10"
          aria-label="Next"
        >
          <ChevronRight className="w-7 h-7" strokeWidth={1.25} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`banner-carousel-dot ${i === index ? 'active' : ''}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}