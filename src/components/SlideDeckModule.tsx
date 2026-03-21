'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Slide {
  title: string;
  body: string;
}

interface SlideDeckModuleProps {
  slides: Slide[];
}

// Cycling accent colors for slide headers
const SLIDE_ACCENTS = [
  { from: 'from-blue-600', to: 'to-indigo-600', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { from: 'from-violet-600', to: 'to-purple-600', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { from: 'from-emerald-600', to: 'to-teal-600', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { from: 'from-orange-600', to: 'to-amber-600', badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { from: 'from-rose-600', to: 'to-pink-600', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
];

export function SlideDeckModule({ slides }: SlideDeckModuleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const total = slides.length;
  const current = slides[currentIndex];
  const accent = SLIDE_ACCENTS[currentIndex % SLIDE_ACCENTS.length];

  // Card = 112px wide, gap = 8px between cards
  // Window shows 3 full cards + ~40px peek of 4th
  // Keep active card centred once past slide 2 (index >= 2)
  const CARD_W = 112;
  const GAP = 8;
  const windowStart = currentIndex <= 1 ? 0 : currentIndex - 1;
  const translateX = windowStart * (CARD_W + GAP);

  const goNext = () => {
    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex(i => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <Layers className="w-4 h-4 text-violet-500" />
          Slide Deck
        </div>
        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
          {currentIndex + 1} <span className="text-slate-300 dark:text-slate-600">/</span> {total}
        </span>
      </div>

      {/* Slide */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/8 bg-white dark:bg-[#1C1F26] shadow-xl shadow-slate-200/30 dark:shadow-none min-h-[380px] md:min-h-[440px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col md:flex-row w-full min-h-[380px] md:min-h-[440px]"
          >
            {/* Left accent strip */}
            <div className={cn(
              'w-full md:w-2 shrink-0 bg-linear-to-b rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none h-2 md:h-auto',
              accent.from, accent.to
            )} />

            {/* Content */}
            <div className="flex flex-col gap-6 p-6 md:p-10 flex-1">
              {/* Slide number badge */}
              <div className={cn('inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest', accent.badge)}>
                Slide {currentIndex + 1}
              </div>

              {/* Title */}
              <h2 className={cn(
                'text-xl md:text-3xl font-heading font-bold bg-linear-to-r bg-clip-text text-transparent leading-tight',
                accent.from, accent.to
              )}>
                {current.title}
              </h2>

              {/* Body */}
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-lg leading-relaxed font-medium flex-1">
                {current.body}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={cn(
              'rounded-full transition-all duration-300',
              i === currentIndex
                ? 'w-5 h-1.5 bg-violet-500'
                : 'w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600',
            )}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Thumbnail strip — 3 full cards + peek of 4th */}
        <div className="hidden sm:block overflow-hidden" style={{ width: `${CARD_W * 3 + GAP * 2 + 40}px` }}>
          <motion.div
            className="flex"
            style={{ gap: `${GAP}px` }}
            animate={{ x: -translateX }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                style={{ width: `${CARD_W}px` }}
                className={cn(
                  'flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all shrink-0',
                  i === currentIndex
                    ? 'border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 opacity-60 hover:opacity-100',
                )}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">#{i + 1}</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 mt-0.5">{s.title}</span>
              </button>
            ))}
          </motion.div>
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
