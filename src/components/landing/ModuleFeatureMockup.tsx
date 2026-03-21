'use client';

import { motion } from 'framer-motion';
import { FileText, Play } from 'lucide-react';

export function ModuleFeatureMockup() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="w-full relative z-10"
    >
      <div className="bg-white dark:bg-[#16181D] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Mockup Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white shrink-0">
            <FileText className="w-6 h-6 fill-current opacity-90" />
          </div>
          <div>
            <h4 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">Module 2: The Core Logic</h4>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1 block">Recommended: 1h 15m remaining</span>
          </div>
        </div>

        {/* Video Card Mockup */}
        <div className="bg-slate-50 dark:bg-[#20232B] border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-10 bg-slate-200 dark:bg-[#313541] rounded-[10px] flex items-center justify-center">
                <Play className="w-4 h-4 text-slate-600 dark:text-white fill-current" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-[15px]">Understanding Closures & Scoping</span>
            </div>
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest hidden sm:block mt-1">Video Curator</span>
          </div>
          <div className="flex gap-3">
            <span className="px-4 py-1.5 bg-white dark:bg-[#14151A] border border-slate-200 dark:border-transparent rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-widest">JS CORE</span>
            <span className="px-4 py-1.5 bg-white dark:bg-[#14151A] border border-slate-200 dark:border-transparent rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-widest">ADVANCED</span>
          </div>
        </div>

        {/* AI Bridge Note Mockup */}
        <div className="bg-emerald-50 dark:bg-[#122F26] border border-emerald-200 dark:border-[#059669]/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-[#10b981] flex items-center justify-center text-white">
              <span className="text-[12px] font-bold italic">i</span>
            </div>
            <span className="text-[11px] font-black text-emerald-700 dark:text-[#10b981] uppercase tracking-[0.15em]">AI Bridge Note</span>
          </div>
          <p className="text-[14px] text-emerald-900 dark:text-emerald-50 leading-[1.8] font-mono">
            <span className="font-sans">The video uses</span> React 17<span className="font-sans">. To use</span> React 18<span className="font-sans">, replace</span> render() <span className="font-sans">with</span> createRoot()<span className="font-sans">.</span>
          </p>
        </div>

        {/* Decorative Button Mockup */}
        <div className="w-full mt-2 py-4 bg-blue-600 rounded-[14px] text-white font-bold text-center text-sm shadow-md pointer-events-none">
          Start Module Quiz
        </div>
      </div>
    </motion.div>
  );
}
