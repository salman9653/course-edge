'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GenerationErrorViewProps {
  onRetry: () => void;
  onClose: () => void;
}

export function GenerationErrorView({ onRetry, onClose }: GenerationErrorViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 dark:bg-red-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-red-500 mb-4 md:mb-6 shadow-inner">
        <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <h3 className="text-xl md:text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2 md:mb-3">
        Unable to Create Course
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-sm mb-6 md:mb-8 leading-relaxed px-4">
        Something went wrong while generating your course. This can happen due to a network timeout or AI service issue. Please try again.
      </p>
      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={onClose}
          className="flex-1 py-3 md:py-3.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl md:rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-xs md:text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-xs md:text-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" /> Try Again
        </button>
      </div>
    </motion.div>
  );
}
