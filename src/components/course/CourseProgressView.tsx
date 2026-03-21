'use client';

import { db } from '@/lib/firebase/client';
import { collection, query, getDocs, DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Loader2, BrainCircuit, CheckCircle2, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModuleData extends DocumentData {
  id: string;
  title: string;
  type: 'video' | 'infographics' | 'quiz' | 'flashcard' | 'slideDeck';
  description: string;
  order_index: number;
  content?: string;
  youtube_links?: string[];
  search_query?: string;
  is_completed?: boolean;
  quiz_metadata?: {
    type: 'small' | 'major';
    question_count: number;
    context_summary: string;
  };
  flashcard_data?: { front: string; back: string }[];
  slides?: { title: string; body: string }[];
}

export interface PhaseData {
  id: string;
  title: string;
  order_index: number;
  modules: ModuleData[];
}

export function CourseProgressView({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<PhaseData[]>([]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId) return;
      try {
        const phasesSnap = await getDocs(query(collection(db, 'courses', courseId, 'phases')));
        const phasesData = await Promise.all(phasesSnap.docs.map(async (pDoc) => {
          const modsSnap = await getDocs(query(collection(db, 'courses', courseId, 'phases', pDoc.id, 'modules')));
          const modules = modsSnap.docs.map(m => m.data() as ModuleData);
          return {
            id: pDoc.id,
            title: pDoc.data().title,
            order_index: pDoc.data().order_index,
            modules,
          } as PhaseData;
        }));
        setPhases(phasesData.sort((a,b) => a.order_index - b.order_index));
      } catch (error) {
        console.error("Failed to fetch course progress", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="animate-pulse">Loading course progress...</p>
      </div>
    );
  }

  const totalModules = phases.reduce((acc, p) => acc + p.modules.length, 0);
  const completedModules = phases.reduce((acc, p) => acc + p.modules.filter((m: ModuleData) => m.is_completed).length, 0);
  const progressPercent = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);

  const smallQuizzesPassed = phases.reduce((acc, p) => acc + p.modules.filter((m: ModuleData) => m.type === 'quiz' && m.quiz_metadata?.type === 'small' && m.is_completed).length, 0);
  const majorQuizzesPassed = phases.reduce((acc, p) => acc + p.modules.filter((m: ModuleData) => m.type === 'quiz' && (!m.quiz_metadata || m.quiz_metadata?.type === 'major') && m.is_completed).length, 0);

  return (
    <div className="w-full p-4 md:p-6 pb-32">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-2xl md:text-4xl font-heading font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
          Your Learning Journey
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Track your overall progress and see what&apos;s coming next.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white dark:bg-[#1C1F26] p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
            <Target className="w-8 h-8" />
          </div>
          <span className="text-3xl font-heading font-bold dark:text-white mb-1">{progressPercent}%</span>
          <span className="text-sm font-bold tracking-widest uppercase text-slate-500">Completed</span>
        </div>
        <div className="bg-white dark:bg-[#1C1F26] p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-3xl font-heading font-bold dark:text-white mb-1">{completedModules} / {totalModules}</span>
          <span className="text-sm font-bold tracking-widest uppercase text-slate-500">Modules Done</span>
        </div>
        <div className="bg-white dark:bg-[#1C1F26] p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <span className="text-3xl font-heading font-bold dark:text-white mb-1">{phases.filter(p => p.modules.every((m: ModuleData) => m.is_completed) && p.modules.length > 0).length}</span>
          <span className="text-sm font-bold tracking-widest uppercase text-slate-500">Phases Mastered</span>
        </div>
        <div className="bg-white dark:bg-[#1C1F26] p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center">
               <span className="text-2xl font-heading font-bold dark:text-white mb-1">{smallQuizzesPassed}</span>
               <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Small</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-col items-center">
               <span className="text-2xl font-heading font-bold dark:text-white mb-1">{majorQuizzesPassed}</span>
               <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Major</span>
            </div>
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-slate-500 mt-3">Quizzes Passed</span>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold dark:text-white mb-6">Phase Breakdown</h2>
        {phases.map((phase) => {
          const pTotal = phase.modules.length;
          const pCompleted = phase.modules.filter((m: ModuleData) => m.is_completed).length;
          const pPercent = pTotal === 0 ? 0 : Math.round((pCompleted / pTotal) * 100);
          const isMastered = pTotal > 0 && pCompleted === pTotal;

          return (
            <div key={phase.id} className="bg-white dark:bg-[#1C1F26] p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isMastered && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  <h3 className={cn("text-lg font-bold", isMastered ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200")}>{phase.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span>{pCompleted} of {pTotal} modules</span>
                  <span>{pPercent}% complete</span>
                </div>
              </div>
              <div className="w-full md:w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", isMastered ? "bg-emerald-500" : "bg-blue-500")}
                  style={{ width: `${pPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
