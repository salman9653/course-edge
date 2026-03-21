'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight, BrainCircuit } from 'lucide-react';
import { GeneratingAnimation } from './GeneratingAnimation';
import { GenerationErrorView } from './GenerationErrorView';

const PLACEHOLDER_EXAMPLES = [
  "Advanced Data Structures in Python",
  "Introduction to Machine Learning",
  "Creative Writing for Beginners",
  "Space Exploration History",
  "Financial Independence Strategies",
  "Mastering UI Design Systems"
];

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  setTopic: (topic: string) => void;
  level: string;
  setLevel: (level: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  isLanguageDropdownOpen: boolean;
  setIsLanguageDropdownOpen: (open: boolean) => void;
  generating: boolean;
  generationError: boolean;
  placeholderIndex: number;
  handleGenerate: (e: React.FormEvent) => void;
  handleRetryGenerate: () => void;
}

export function CreateCourseModal({
  isOpen,
  onClose,
  topic,
  setTopic,
  level,
  setLevel,
  language,
  setLanguage,
  isLanguageDropdownOpen,
  setIsLanguageDropdownOpen,
  generating,
  generationError,
  placeholderIndex,
  handleGenerate,
  handleRetryGenerate
}: CreateCourseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-2xl bg-white dark:bg-[#1C1F26] rounded-[2rem] md:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/60 dark:border-white/5 p-6 md:p-16">
        {!generating && !generationError && <button onClick={onClose} className="absolute top-4 right-4 md:top-10 md:right-10 p-2 md:p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:rotate-90 bg-slate-100 dark:bg-white/5 rounded-xl md:rounded-2xl"><X className="w-5 h-5 md:w-6 md:h-6" /></button>}
        {generationError && <button onClick={onClose} className="absolute top-4 right-4 md:top-10 md:right-10 p-2 md:p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:rotate-90 bg-slate-100 dark:bg-white/5 rounded-xl md:rounded-2xl"><X className="w-5 h-5 md:w-6 md:h-6" /></button>}
        
        {generating ? (
          <GeneratingAnimation />
        ) : generationError ? (
          <GenerationErrorView onRetry={handleRetryGenerate} onClose={onClose} />
        ) : (
          <>
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-heading font-bold mb-3 md:mb-4 tracking-tight text-slate-900 dark:text-white mt-4">Architect New Course</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg">Define a topic and let AI curate your personalized learning roadmap.</p>
            </div>
            <form onSubmit={handleGenerate} className="space-y-6 md:space-y-10">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 tracking-widest uppercase italic ml-1 opacity-70">Topic</label>
                <div className="relative group">
                  <Sparkles className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-blue-500 transition-transform group-focus-within:scale-125" />
                  <AnimatePresence mode="wait">
                    <input 
                      type="text" 
                      required 
                      value={topic} 
                      onChange={(e) => setTopic(e.target.value)} 
                      placeholder={`e.g. ${PLACEHOLDER_EXAMPLES[placeholderIndex]}`} 
                      className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg md:text-xl font-medium" 
                    />
                  </AnimatePresence>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 tracking-widest uppercase italic ml-1 opacity-70">Experience Level</label>
                <div className="grid grid-cols-3 gap-3 md:gap-5">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button key={lvl} type="button" onClick={() => setLevel(lvl)} className={`py-4 md:py-5 rounded-xl md:rounded-2xl border-2 text-xs md:text-sm font-bold transition-all ${level === lvl ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] scale-[1.05]' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 hover:border-slate-400'}`}>{lvl}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 relative">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 tracking-widest uppercase italic ml-1 opacity-70">Language</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className={`w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50 dark:bg-white/5 border ${isLanguageDropdownOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 dark:border-white/10'} rounded-xl md:rounded-2xl outline-none transition-all text-base md:text-lg font-medium text-left flex items-center justify-between`}
                  >
                    <span className="text-slate-900 dark:text-slate-200">{language}</span>
                    <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 text-slate-400 transition-transform ${isLanguageDropdownOpen ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isLanguageDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setLanguage('English');
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`w-full px-6 py-3 text-left transition-colors ${language === 'English' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'} font-medium`}
                        >
                          English
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="pt-4 md:pt-6">
                <button type="submit" disabled={generating || !topic} className="w-full py-4 md:py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl md:rounded-[2rem] font-heading font-bold text-lg md:text-xl transition-all shadow-[0_20px_40px_-5px_rgba(59,130,246,0.5)] flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50 active:scale-[0.98]">
                  <BrainCircuit className="w-6 h-6 md:w-7 md:h-7" /> Architect Journey
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
