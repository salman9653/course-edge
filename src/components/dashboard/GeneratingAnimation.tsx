'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export const GENERATION_STEPS = [
  "Analyzing topic and scope...",
  "Searching for relevant research...",
  "Curating high-quality resources...",
  "Identifying key learning concepts...",
  "Structuring learning phases...",
  "Finding best educational videos...",
  "Generating practice exercises...",
  "Designing interactive quizzes...",
  "Synthesizing curriculum...",
  "Optimizing knowledge flow...",
  "Mapping module dependencies...",
  "Finalizing your roadmap..."
];

export function GeneratingAnimation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle text every 4.5s
    const textInterval = setInterval(() => {
      setStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);

    // Smoother, independent progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Hold at 95% until finished
        const increment = Math.random() * 0.5; // Very slow crawl
        return Math.min(prev + increment, 95);
      });
    }, 200);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-8 md:mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-200 dark:border-white/5 border-t-blue-600 dark:border-t-blue-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 md:w-20 md:h-20 bg-blue-600 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)]"
          >
            <BrainCircuit className="w-7 h-7 md:w-10 md:h-10 text-white" />
          </motion.div>
        </div>
      </div>

      <h3 className="text-xl md:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2 md:mb-4">
        AI is architecting...
      </h3>
      
      <div className="h-8 mb-8 md:mb-12 text-center px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium"
          >
            {GENERATION_STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden shadow-inner">
        <motion.div 
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
