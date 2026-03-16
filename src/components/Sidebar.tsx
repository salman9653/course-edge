'use client';

import { useCourseStore } from '@/lib/store/useCourseStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, PlayCircle, ChevronDown, ChevronRight, FileText, BrainCircuit, CheckCircle2, ArrowLeft, TrendingUp } from 'lucide-react';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { useState } from 'react';
import Link from 'next/link';

export interface Module {
  id: string;
  title: string;
  type?: 'video' | 'infographics' | 'quiz';
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
  const { activePhaseId, activeModuleId, unlockedPhases, setActiveModule } = useCourseStore();
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleModuleClick = (phaseId: string, moduleId: string) => {
    setActiveModule(phaseId, moduleId);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-transparent p-4 shrink-0 flex flex-col">
      <div className="mb-6 flex flex-col gap-4">
        <Link 
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <h2 className="text-xl pl-2 font-heading font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{courseTitle || APP_NAME}</h2>
      </div>

      {/* Progress Card */}
      <div 
        onClick={() => setActiveModule('course-progress', 'course-progress')}
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
            {Math.round((phases.reduce((acc, p) => acc + p.modules.filter(m => m.is_completed).length, 0) / Math.max(1, phases.reduce((acc, p) => acc + p.modules.length, 0))) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${Math.round((phases.reduce((acc, p) => acc + p.modules.filter(m => m.is_completed).length, 0) / Math.max(1, phases.reduce((acc, p) => acc + p.modules.length, 0))) * 100)}%` }} 
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {phases.sort((a,b) => a.order_index - b.order_index).map((phase) => {
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
    </div>
  );
}
