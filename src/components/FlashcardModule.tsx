'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  front: string;
  back: string;
}

interface FlashcardModuleProps {
  cards: FlashcardProps[];
}

// Each entry: front gradient, back gradient
const CARD_ACCENTS = [
  { front: 'from-blue-600 via-blue-700 to-indigo-700 border-blue-500/30',   back: 'from-emerald-500 via-emerald-600 to-teal-700 border-emerald-500/30' },
  { front: 'from-violet-600 via-purple-700 to-fuchsia-700 border-violet-500/30', back: 'from-rose-500 via-pink-600 to-pink-700 border-rose-500/30' },
  { front: 'from-orange-500 via-orange-600 to-amber-600 border-orange-500/30',  back: 'from-teal-500 via-teal-600 to-cyan-700 border-teal-500/30' },
  { front: 'from-rose-600 via-rose-700 to-pink-700 border-rose-500/30',      back: 'from-indigo-500 via-indigo-600 to-violet-700 border-indigo-500/30' },
  { front: 'from-cyan-600 via-sky-600 to-blue-700 border-cyan-500/30',       back: 'from-amber-500 via-orange-500 to-orange-600 border-amber-500/30' },
  { front: 'from-green-600 via-emerald-600 to-teal-700 border-green-500/30', back: 'from-purple-500 via-violet-600 to-indigo-700 border-purple-500/30' },
];

export function FlashcardModule({ cards }: FlashcardModuleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const total = cards.length;
  const current = cards[currentIndex];
  const accent = CARD_ACCENTS[currentIndex % CARD_ACCENTS.length];

  const goNext = () => {
    if (currentIndex < total - 1) {
      setDirection('right');
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(i => i + 1), 80);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection('left');
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(i => i - 1), 80);
    }
  };

  const handleFlip = () => setIsFlipped(f => !f);

  return (
    <div className="flex flex-col items-center gap-8 w-full py-4">

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Flashcards
        </div>
        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
          {currentIndex + 1} <span className="text-slate-300 dark:text-slate-600">/</span> {total}
        </span>
      </div>

      {/* Card */}
      <div
        className="relative w-full h-[320px] md:h-[400px] cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={handleFlip}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction === 'right' ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'right' ? -60 : 60 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {/* Inner flip container */}
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.55s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }}
            >
              {/* Front */}
              <div
                className={cn(
                  'absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-6 md:p-10 text-center shadow-2xl border select-none',
                  `bg-linear-to-br ${accent.front}`,
                )}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute top-5 left-5 text-[10px] font-bold uppercase tracking-widest text-white/40 select-none">
                  Question
                </div>
                <p className="text-white text-lg md:text-xl font-semibold leading-relaxed">
                  {current.front}
                </p>
                <div className="absolute bottom-5 right-5 flex items-center gap-1.5 text-white/40 text-[11px] font-bold uppercase tracking-widest select-none">
                  <RotateCcw className="w-3 h-3" />
                  Click to reveal
                </div>
              </div>

              {/* Back */}
              <div
                className={cn(
                  'absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-6 md:p-10 text-center shadow-2xl border select-none',
                  `bg-linear-to-br ${accent.back}`,
                )}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="absolute top-5 left-5 text-[10px] font-bold uppercase tracking-widest text-white/40 select-none">
                  Answer
                </div>
                <p className="text-white text-lg md:text-xl font-semibold leading-relaxed">
                  {current.back}
                </p>
                <div className="absolute bottom-5 right-5 flex items-center gap-1.5 text-white/40 text-[11px] font-bold uppercase tracking-widest select-none">
                  <RotateCcw className="w-3 h-3" />
                  Click to flip back
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 'right' : 'left');
              setIsFlipped(false);
              setTimeout(() => setCurrentIndex(i), 80);
            }}
            className={cn(
              'rounded-full transition-all duration-300',
              i === currentIndex
                ? 'w-5 h-1.5 bg-blue-500'
                : 'w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600',
            )}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
