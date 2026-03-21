'use client';

import { ArrowLeft, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { useCourseStore } from '@/lib/store/useCourseStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar, Phase } from './Sidebar';

export function MobileCourseHeader({ courseTitle, phases }: { courseTitle: string; phases: Phase[] }) {
  const router = useRouter();
  const { isQuizInProgress, setQuizInProgress } = useCourseStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quiz warning state
  const [showWarning, setShowWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<'back' | 'sidebar' | null>(null);

  const handleBack = () => {
    if (isQuizInProgress) {
      setPendingAction('back');
      setShowWarning(true);
      return;
    }
    router.push(ROUTES.DASHBOARD);
  };

  const handleToggleSidebar = () => {
    if (isQuizInProgress && !sidebarOpen) {
      setPendingAction('sidebar');
      setShowWarning(true);
      return;
    }
    setSidebarOpen(!sidebarOpen);
  };

  const confirmAction = () => {
    setQuizInProgress(false);
    if (pendingAction === 'back') {
      router.push(ROUTES.DASHBOARD);
    } else if (pendingAction === 'sidebar') {
      setSidebarOpen(true);
    }
    setShowWarning(false);
    setPendingAction(null);
  };

  return (
    <>
      {/* Mobile Course Header Bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-[#13151A]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="flex-1 text-center text-sm font-bold text-slate-800 dark:text-white truncate px-2 tracking-tight">
          {courseTitle}
        </h1>

        <button
          onClick={handleToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Open course menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-in Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed top-0 right-0 z-70 w-[85vw] max-w-[360px] h-full bg-white dark:bg-[#1A1D24] border-l border-slate-200/60 dark:border-[#2A2E35] shadow-2xl flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200/60 dark:border-white/10 shrink-0">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Course Menu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reuse existing Sidebar content – it handles all phase/module navigation */}
              <div className="flex-1 overflow-y-auto" onClick={(e) => {
                // Close sidebar when a module is clicked (look for button clicks inside)
                const target = e.target as HTMLElement;
                if (target.closest('button') && !target.closest('[data-phase-toggle]')) {
                  // Small delay so the navigation happens first
                  setTimeout(() => setSidebarOpen(false), 150);
                }
              }}>
                <Sidebar phases={phases} courseTitle={courseTitle} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quiz Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <div className="md:hidden fixed inset-0 z-80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWarning(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1C1F26] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center gap-4 relative z-10">
                <h3 className="text-lg font-bold dark:text-white">Finish the quiz first!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your progress will be lost if you leave during a quiz.
                </p>
                <div className="flex flex-col w-full gap-3 mt-2">
                  <button
                    onClick={() => setShowWarning(false)}
                    className="w-full py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/25"
                  >
                    Stay and Finish
                  </button>
                  <button
                    onClick={confirmAction}
                    className="w-full py-3.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
                  >
                    Leave Anyway
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
