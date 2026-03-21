'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleData } from './CourseProgressView';

interface ModuleNavigationProps {
  moduleData: ModuleData;
  isLastModule: boolean;
  nextModuleId: string | null;
  handleCompleteAndNext: () => void;
  isAnyModulePending: boolean;
  isOtherModulesPending: boolean;
  isQuizInProgress: boolean;
}

export function ModuleNavigation({
  moduleData,
  isLastModule,
  nextModuleId,
  handleCompleteAndNext,
  isAnyModulePending,
  isOtherModulesPending,
  isQuizInProgress
}: ModuleNavigationProps) {
  return (
    <>
      <div className="flex flex-col items-end gap-6 mt-12">
        {moduleData.type !== 'quiz' && (
          <button 
            onClick={handleCompleteAndNext}
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-semibold shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all hover:scale-105 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            disabled={!nextModuleId && isLastModule}
          >
            {moduleData.is_completed ? 'Next Module' : 'Complete & Continue'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {isLastModule && isAnyModulePending && !isQuizInProgress && (
        <div className={cn(
          "w-full mt-12 mb-20 p-6 rounded-3xl border text-center transition-colors duration-500",
          isOtherModulesPending 
            ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20" 
            : "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
        )}>
          <p className={cn(
            "font-bold text-lg",
            isOtherModulesPending ? "text-amber-800 dark:text-amber-400" : "text-emerald-800 dark:text-emerald-400"
          )}>
            {isOtherModulesPending 
              ? "Modules Pending: Complete every module and pass all quizzes to unlock the next phase!"
              : "Ready to Advance: Complete this major quiz to unlock the next phase!"}
          </p>
        </div>
      )}
    </>
  );
}
