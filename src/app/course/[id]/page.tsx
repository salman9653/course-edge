'use client';

import { useCourseStore } from '@/lib/store/useCourseStore';
import { db } from '@/lib/firebase/client';
import { doc, collection, query, getDocs, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { CourseProgressView, ModuleData } from '@/components/course/CourseProgressView';
import { PhaseGenerationLoading, PHASE_GENERATION_STEPS } from '@/components/course/PhaseGenerationLoading';
import { ModuleContent } from '@/components/course/ModuleContent';
import { ModuleNavigation } from '@/components/course/ModuleNavigation';

export default function CoursePage() {
  const { activeCourseId, activeModuleId, activePhaseId, setActiveModule, isQuizInProgress } = useCourseStore();
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [phaseModules, setPhaseModules] = useState<ModuleData[]>([]);
  const [phaseTitle, setPhaseTitle] = useState<string>('');
  const isOnline = useNetworkStatus();

  // Phase Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => setGenStep((p) => (p + 1) % PHASE_GENERATION_STEPS.length), 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Scroll to top only once the new module's content is actually loaded and rendered
  useEffect(() => {
    if (!moduleData?.id) return;
    const container = document.getElementById('course-scroll-container');
    if (container) container.scrollTop = 0;
  }, [moduleData?.id]);

  useEffect(() => {
    if (!activeCourseId || !activePhaseId || activeModuleId === 'course-progress') return;
    const fetchPhaseModules = async () => {
      // Fetch modules
      const q = query(collection(db, 'courses', activeCourseId, 'phases', activePhaseId, 'modules'));
      const snap = await getDocs(q);
      const mods = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ModuleData[];
      setPhaseModules(mods.sort((a, b) => a.order_index - b.order_index));

      // Fetch phase title and check generation status
      const currentPhaseDoc = await getDoc(doc(db, 'courses', activeCourseId, 'phases', activePhaseId));
      if (currentPhaseDoc.exists()) {
        const pData = currentPhaseDoc.data();
        setPhaseTitle(pData.title);

        if (pData.is_unlocked && pData.is_generated === false) {
          setIsGenerating(true);
          try {
            const res = await fetch('/api/generate-phase-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courseId: activeCourseId, phaseId: activePhaseId }),
            });
            const data = await res.json();
            if (data.success) {
              // Mark local state as generated so it doesn't refire
            }
          } catch (error) {
            console.error('Failed to generate phase:', error);
          } finally {
            setIsGenerating(false);
          }
        }
      }
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

  if (isGenerating) {
    return <PhaseGenerationLoading isGenerating={isGenerating} genStep={genStep} />;
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

  const isOtherModulesPending = phaseModules.filter(m => m.id !== activeModuleId).some(m => !m.is_completed);
  const isAnyModulePending = isOtherModulesPending || !moduleData.is_completed;

  return (
    <div className="w-full p-4 md:p-6 pb-32">
      {!isOnline && (
        <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center gap-3 shadow-sm backdrop-blur-md">
          <WifiOff className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Offline Mode: Videos are unavailable, but your AI notes are cached for reading.</p>
        </div>
      )}

      <ModuleContent 
        moduleData={moduleData}
        isOnline={isOnline}
        activeCourseId={activeCourseId || ''}
        activePhaseId={activePhaseId || ''}
        activeModuleId={activeModuleId || ''}
        nextModuleId={nextModuleId}
        setActiveModule={setActiveModule}
        phaseTitle={phaseTitle}
      />

      <ModuleNavigation 
        moduleData={moduleData}
        isLastModule={isLastModule}
        nextModuleId={nextModuleId}
        handleCompleteAndNext={handleCompleteAndNext}
        isAnyModulePending={isAnyModulePending}
        isOtherModulesPending={isOtherModulesPending}
        isQuizInProgress={isQuizInProgress}
      />
    </div>
  );
}
