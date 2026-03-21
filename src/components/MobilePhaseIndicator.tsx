'use client';

import { useCourseStore } from '@/lib/store/useCourseStore';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Phase } from './Sidebar';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobilePhaseIndicator({ phases }: { phases: Phase[] }) {
  const { activePhaseId, activeModuleId } = useCourseStore();
  const [expanded, setExpanded] = useState(false);

  if (activeModuleId === 'course-progress') return null;

  const activePhase = phases.find(p => p.id === activePhaseId);
  const activeModule = activePhase?.modules.find(m => m.id === activeModuleId);

  if (!activePhase || !activeModule) return null;

  // Shorten phase title: e.g. "Phase 1: Next.js Foundations and Core Concepts" → "Phase 1: Next.js Foundations"
  const shortPhaseTitle = activePhase.title.length > 35
    ? activePhase.title.slice(0, 32) + '...'
    : activePhase.title;

  return (
    <div className="md:hidden mx-3 mt-2 mb-1">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-slate-100/80 dark:bg-[#1C1F26] border border-slate-200/60 dark:border-[#2A2E35] rounded-2xl overflow-hidden transition-colors active:bg-slate-200/80 dark:active:bg-[#22252C]"
      >
        {/* Phase Row */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          {expanded 
            ? <ChevronDown className="w-4 h-4 text-blue-500 shrink-0" /> 
            : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          }
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 text-left truncate flex-1">
            {shortPhaseTitle}
          </span>
        </div>

        {/* Module Row (nested, shown as sub-item) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-4 py-3 ml-4 border-t border-slate-200/40 dark:border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 text-left truncate">
                  {activeModule.title}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
