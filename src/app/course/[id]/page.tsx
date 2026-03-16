'use client';

import { useCourseStore } from '@/lib/store/useCourseStore';
import { db } from '@/lib/firebase/client';
import { doc, collection, query, getDocs, onSnapshot, DocumentData, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Loader2, ArrowRight, BrainCircuit, WifiOff, CheckCircle2, Trophy, Target } from 'lucide-react';
import { QuizModal } from '@/components/QuizModal';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

interface ModuleData extends DocumentData {
  id: string;
  title: string;
  type: 'video' | 'infographics' | 'quiz';
  description: string;
  order_index: number;
  content?: string; // infographic markdown
  youtube_links?: string[];
  search_query?: string;
  is_completed?: boolean;
  quiz_metadata?: {
    type: 'small' | 'major';
    question_count: number;
    context_summary: string;
  };
}

interface PhaseData {
  id: string;
  title: string;
  order_index: number;
  modules: ModuleData[];
}

function CourseProgressView({ courseId }: { courseId: string }) {
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
    <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-32">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-heading font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
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

export default function CoursePage() {
  const { activeCourseId, activeModuleId, activePhaseId, setActiveModule } = useCourseStore();
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [phaseModules, setPhaseModules] = useState<ModuleData[]>([]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!activeCourseId || !activePhaseId || activeModuleId === 'course-progress') return;
    const fetchPhaseModules = async () => {
      const q = query(collection(db, 'courses', activeCourseId, 'phases', activePhaseId, 'modules'));
      const snap = await getDocs(q);
      const mods = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ModuleData[];
      setPhaseModules(mods.sort((a, b) => a.order_index - b.order_index));
    };
    fetchPhaseModules();
  }, [activeCourseId, activePhaseId, activeModuleId]);

  useEffect(() => {
    if (!activeCourseId || !activePhaseId || !activeModuleId || activeModuleId === 'course-progress') return;

    const unsubscribe = onSnapshot(doc(db, 'courses', activeCourseId, 'phases', activePhaseId, 'modules', activeModuleId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ModuleData;
        setModuleData({ ...data, id: docSnap.id } as ModuleData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [activeCourseId, activePhaseId, activeModuleId]);

  if (!activeModuleId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Select a module to begin learning.
      </div>
    );
  }

  if (activeModuleId === 'course-progress' && activeCourseId) {
    return <CourseProgressView courseId={activeCourseId} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="animate-pulse">Curating your AI notes and videos...</p>
      </div>
    );
  }

  if (!moduleData) return null;

  const currentIndex = phaseModules.findIndex(m => m.id === activeModuleId);
  const isLastModule = currentIndex === phaseModules.length - 1;
  const nextModuleId = isLastModule ? null : phaseModules[currentIndex + 1]?.id;

  const handleCompleteAndNext = async () => {
    if (!activeCourseId || !activePhaseId || !activeModuleId) return;
    
    // Mark current module as completed
    const moduleRef = doc(db, 'courses', activeCourseId, 'phases', activePhaseId, 'modules', activeModuleId);
    try {
      await updateDoc(moduleRef, { is_completed: true });
    } catch (error) {
      console.error('Failed to mark module as completed:', error);
    }

    // Move to next module
    if (nextModuleId) {
      setActiveModule(activePhaseId, nextModuleId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-32">
      {!isOnline && (
        <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center gap-3 shadow-sm backdrop-blur-md">
          <WifiOff className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Offline Mode: Videos are unavailable, but your AI notes are cached for reading.</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
          {moduleData.title}
        </h1>
        
        {moduleData.type === 'video' && (
          <div className="flex flex-col gap-6">
            {isOnline ? (
              <VideoPlayer videoIds={moduleData.youtube_links && moduleData.youtube_links.length > 0 ? [moduleData.youtube_links[0]] : []} />
            ) : (
            <div className="w-full aspect-video bg-slate-900/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 border border-slate-800 border-dashed">
              <div className="flex flex-col items-center">
                <WifiOff className="w-8 h-8 mb-2 opacity-50" />
                <span>Video player unavailable offline</span>
              </div>
            </div>
            )}
            
            {moduleData.content && (
              <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:bg-linear-to-r prose-headings:from-blue-600 prose-headings:to-indigo-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-a:text-blue-500 hover:prose-a:text-blue-600 p-4 bg-slate-50 dark:bg-[#13151A] rounded-2xl border border-slate-100 dark:border-[#2A2E35]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {moduleData.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {moduleData.type === 'infographics' && (
          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:bg-linear-to-r prose-headings:from-blue-600 prose-headings:to-indigo-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-a:text-blue-500 hover:prose-a:text-blue-600 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {moduleData.content || "Infographic content is not available."}
            </ReactMarkdown>
          </div>
        )}

        {moduleData.type === 'quiz' && (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BrainCircuit className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Knowledge Check</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Time to test what you&apos;ve learned in this phase. Passing this quiz unlocks the next phase.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-12 mb-20">
        {moduleData.type === 'quiz' ? (
          <button 
            onClick={() => setIsQuizOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
          >
            <BrainCircuit className="w-5 h-5" />
            Start Quiz
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
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

      <QuizModal 
        courseId={activeCourseId || ''}
        phaseId={activePhaseId || ''} 
        moduleId={activeModuleId || ''}
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
      />
    </div>
  );
}
