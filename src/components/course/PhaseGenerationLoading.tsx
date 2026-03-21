'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export const PHASE_GENERATION_STEPS = [
  "Analyzing new phase syllabus...",
  "Gathering comprehensive study notes...",
  "Structuring module contents...",
  "Generating interactive flashcards...",
  "Designing presentation slides...",
  "Curating relevant video content...",
  "Finalizing phase assets..."
];

interface PhaseGenerationLoadingProps {
  isGenerating: boolean;
  genStep: number;
}

export function PhaseGenerationLoading({ isGenerating, genStep }: PhaseGenerationLoadingProps) {
  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-10 max-w-sm w-full text-center"
      >
        <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-3xl animate-ping" />
          <BrainCircuit className="w-10 h-10 text-blue-500" />
        </div>
        
        <h3 className="text-2xl font-bold dark:text-white mb-3 tracking-tight">Leveling Up!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
           You&apos;ve unlocked the next phase. Hang tight while the AI prepares your new lessons...
        </p>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-4">
           <motion.div 
             className="h-full bg-blue-500 rounded-full"
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 15, ease: "linear" }}
           />
        </div>
        
        <div className="h-6">
          <AnimatePresence mode="wait">
            <motion.p 
              key={genStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs font-bold uppercase tracking-widest text-blue-500"
            >
              {PHASE_GENERATION_STEPS[genStep]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
