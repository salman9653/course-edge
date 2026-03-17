'use client';

import { useCourseStore } from '@/lib/store/useCourseStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, PlayCircle, ChevronDown, ChevronRight, FileText, BrainCircuit, CheckCircle2, ArrowLeft, TrendingUp, BookOpen, Layers } from 'lucide-react';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, onSnapshot, DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export interface Module {
  id: string;
  title: string;
  type?: 'video' | 'infographics' | 'quiz' | 'flashcard' | 'slideDeck';
  order_index: number;
  is_completed?: boolean;
}

export interface Phase {
  id: string;
  title: string;
  order_index: number;
  modules: Module[];
}

export function Sidebar({ phases, courseTitle }: { phases: Phase[], courseTitle?: string }) {
  const router = useRouter();
  const { activeCourseId, activePhaseId, activeModuleId, unlockedPhases, setActiveModule, isQuizInProgress, setQuizInProgress } = useCourseStore();
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  // Seed with server-fetched data so sidebar is populated immediately on first render
  const [livePhases, setLivePhases] = useState<Phase[]>(phases);
  
  // Custom Alert State
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNav, setPendingNav] = useState<{ phaseId?: string, moduleId?: string, route?: string }>({});

  // Subscribe to real-time module updates for every phase
  useEffect(() => {
    if (!activeCourseId) return;
    
    const unsubscribers = phases.map((phase) => {
      const modulesQuery = query(
        collection(db, 'courses', activeCourseId, 'phases', phase.id, 'modules')
      );
      return onSnapshot(modulesQuery, (snap) => {
        const updatedModules: Module[] = snap.docs.map((d: DocumentData) => ({
          id: d.id,
          title: d.data().title,
          type: d.data().type,
          order_index: d.data().order_index,
          is_completed: d.data().is_completed || false,
        }));
        setLivePhases((prev) =>
          prev.map((p) =>
            p.id === phase.id ? { ...p, modules: updatedModules } : p
          )
        );
      });
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourseId]);

  const togglePhase = (phaseId: string) => {
    if (isQuizInProgress) {
      setPendingNav({ phaseId });
      setShowWarning(true);
      return;
    }
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleModuleClick = (phaseId: string, moduleId: string) => {
    if (isQuizInProgress) {
      setPendingNav({ phaseId, moduleId });
      setShowWarning(true);
      return;
    }
    setActiveModule(phaseId, moduleId);
  };

  const confirmNavigation = () => {
    setQuizInProgress(false);
    if (pendingNav.route) {
      router.push(pendingNav.route);
    } else if (pendingNav.moduleId) {
      setActiveModule(pendingNav.phaseId!, pendingNav.moduleId);
    } else if (pendingNav.phaseId) {
      setExpandedPhases(prev => ({ ...prev, [pendingNav.phaseId!]: !prev[pendingNav.phaseId!] }));
    }
    setShowWarning(false);
    setPendingNav({});
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-transparent p-4 shrink-0 flex flex-col">
      <div className="mb-6 flex flex-col gap-4">
        <button 
          onClick={() => {
            if (isQuizInProgress) {
              setPendingNav({ route: ROUTES.DASHBOARD });
              setShowWarning(true);
              return;
            }
            router.push(ROUTES.DASHBOARD);
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors uppercase tracking-widest group text-left"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <h2 className="text-xl pl-2 font-heading font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{courseTitle || APP_NAME}</h2>
      </div>

      {/* Progress Card */}
      <div 
        onClick={() => {
          if (isQuizInProgress) {
            setPendingNav({ moduleId: 'course-progress', phaseId: 'course-progress' });
            setShowWarning(true);
            return;
          }
          setActiveModule('course-progress', 'course-progress');
        }}
        className={cn(
          "mb-6 p-4 rounded-2xl cursor-pointer border transition-all duration-300 shadow-sm group",
          activeModuleId === 'course-progress' 
            ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
            : "bg-white dark:bg-[#1A1D24] border-slate-200 dark:border-[#2A2E35] hover:border-slate-300 dark:hover:border-slate-700"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className={cn("w-4 h-4", activeModuleId === 'course-progress' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400")} />
            <span className={cn("text-xs font-bold uppercase tracking-widest", activeModuleId === 'course-progress' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400")}>Progress</span>
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {Math.round((livePhases.reduce((acc, p) => acc + p.modules.filter(m => m.is_completed).length, 0) / Math.max(1, livePhases.reduce((acc, p) => acc + p.modules.length, 0))) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${Math.round((livePhases.reduce((acc, p) => acc + p.modules.filter(m => m.is_completed).length, 0) / Math.max(1, livePhases.reduce((acc, p) => acc + p.modules.length, 0))) * 100)}%` }} 
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {livePhases.sort((a,b) => a.order_index - b.order_index).map((phase) => {
          const isUnlocked = unlockedPhases.includes(phase.id);
          const isExpanded = expandedPhases[phase.id] || phase.id === activePhaseId;

          return (
            <div key={phase.id} className="flex flex-col">
              <button 
                onClick={() => isUnlocked ? togglePhase(phase.id) : null}
                disabled={!isUnlocked}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all duration-300",
                  isUnlocked 
                    ? "hover:bg-white/60 dark:hover:bg-slate-800/60 cursor-pointer shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700" 
                    : "opacity-60 cursor-not-allowed bg-slate-100/50 dark:bg-slate-900/50",
                  activePhaseId === phase.id && isUnlocked 
                    ? "bg-white/80 dark:bg-slate-800/80 font-semibold border border-slate-200 dark:border-slate-700 shadow-md" 
                    : ""
                )}
              >
                <div className="flex items-center gap-3">
                  {!isUnlocked ? <Lock className="w-4 h-4 text-slate-400" /> : 
                   isExpanded ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <span className="text-sm dark:text-slate-200 text-slate-800 text-left">{phase.title}</span>
                </div>
              </button>

              <AnimatePresence>
                {isUnlocked && isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden mb-2"
                  >
                    <div className="flex flex-col gap-1 pl-7 pr-2 pt-2 pb-1 border-l-2 ml-[19px] border-slate-200 dark:border-slate-800">
                      {phase.modules.sort((a,b) => a.order_index - b.order_index).map((mod) => {
                        const isActive = activeModuleId === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleModuleClick(phase.id, mod.id)}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg text-sm transition-all text-left duration-200",
                              isActive 
                                ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shadow-sm" 
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                            )}
                          >
                            {mod.is_completed ? (
                               <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                            ) : (
                               <>
                                 {mod.type === 'video' && <PlayCircle className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-500" : "text-slate-400")} />}
                                 {mod.type === 'infographics' && <FileText className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-500" : "text-slate-400")} />}
                                 {mod.type === 'quiz' && <BrainCircuit className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-500" : "text-slate-400")} />}
                                 {mod.type === 'flashcard' && <BookOpen className={cn("w-4 h-4 shrink-0", isActive ? "text-amber-500" : "text-amber-400/70")} />}
                                 {mod.type === 'slideDeck' && <Layers className={cn("w-4 h-4 shrink-0", isActive ? "text-violet-500" : "text-violet-400/70")} />}
                                 {!mod.type && <PlayCircle className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-500" : "text-slate-400")} />}
                               </>
                            )}
                            <span className="line-clamp-2">{mod.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-white dark:bg-[#1C1F26] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16" />
              
              <div className="flex flex-col items-center text-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold dark:text-white">Finish the quiz first!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    A quiz is currently in progress. Your progress will be lost if you change modules in between. Are you sure you want to exit?
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 mt-4">
                  <button
                    onClick={() => setShowWarning(false)}
                    className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/25"
                  >
                    Stay and Finish Quiz
                  </button>
                  <button
                    onClick={confirmNavigation}
                    className="w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
                  >
                    Close Quiz and Leave
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
