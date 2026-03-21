import { Sidebar, Phase, Module } from '@/components/Sidebar';
import { StoreInitializer } from '@/components/StoreInitializer';
import { MobileCourseHeader } from '@/components/MobileCourseHeader';
import { MobilePhaseIndicator } from '@/components/MobilePhaseIndicator';
import { adminDb } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const cId = resolvedParams.id;

  const courseDoc = await adminDb.collection(FIREBASE_COLLECTIONS.COURSES).doc(cId).get();
  if (!courseDoc.exists) {
    notFound();
  }

  const phasesSnapshot = await courseDoc.ref.collection(FIREBASE_COLLECTIONS.PHASES).get();
  
  if (phasesSnapshot.empty) {
    return <div>No phases found.</div>;
  }

  const phasesData: Phase[] = await Promise.all(phasesSnapshot.docs.map(async (doc) => {
    const pData = doc.data();

    const modulesSnapshot = await doc.ref.collection(FIREBASE_COLLECTIONS.MODULES).get();
    const modules: Module[] = modulesSnapshot.docs.map(mDoc => ({
      id: mDoc.id,
      title: mDoc.data().title,
      type: mDoc.data().type,
      order_index: mDoc.data().order_index,
      is_completed: mDoc.data().is_completed || false,
    }));

    return {
      id: doc.id,
      title: pData.title,
      order_index: pData.order_index,
      modules
    };
  }));

  const sortedPhases = phasesData.sort((a,b) => a.order_index - b.order_index);
  const firstPhase = sortedPhases[0];
  const firstModulePhase1 = firstPhase?.modules.sort((a,b) => a.order_index - b.order_index)[0];

  let initialPhaseId = firstPhase?.id || '';
  let initialModuleId = firstModulePhase1?.id || '';
  let foundIncomplete = false;

  for (const phase of sortedPhases) {
    const sortedModules = phase.modules.sort((a,b) => a.order_index - b.order_index);
    for (const mod of sortedModules) {
      if (!mod.is_completed) {
        initialPhaseId = phase.id;
        initialModuleId = mod.id;
        foundIncomplete = true;
        break;
      }
    }
    if (foundIncomplete) break;
  }
  
  const unlockedPhases = phasesSnapshot.docs
    .filter(doc => doc.data().is_unlocked)
    .map(doc => doc.id);

  const courseTitle = courseDoc.data()?.title || 'Course';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F0F4F8] dark:bg-[#0D0F12] overflow-hidden text-slate-900 dark:text-slate-100 pt-[80px]">
      <StoreInitializer 
        courseId={cId} 
        activePhaseId={initialPhaseId} 
        activeModuleId={initialModuleId} 
        unlockedPhases={unlockedPhases} 
      />

      {/* Mobile-only: Course header bar with back, title, hamburger */}
      <MobileCourseHeader courseTitle={courseTitle} phases={phasesData} />
      
      <div className="flex flex-col md:flex-row flex-1 w-full max-w-[1600px] mx-auto md:p-4 md:gap-4 h-full overflow-hidden">
        {/* Desktop Sidebar Card – hidden on mobile */}
        <div className="hidden md:flex w-[320px] h-full bg-white dark:bg-[#1A1D24] rounded-2xl border border-slate-200/60 dark:border-[#2A2E35] overflow-hidden shrink-0 shadow-xs flex-col">
          <Sidebar phases={phasesData} courseTitle={courseTitle} />
        </div>

        {/* Main Content Card */}
        <main className="flex-1 h-full bg-white md:bg-white dark:bg-[#1A1D24] md:rounded-2xl md:border md:border-slate-200/60 md:dark:border-[#2A2E35] overflow-hidden relative md:shadow-xs flex flex-col">
          <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 pointer-events-none" />
          <div id="course-scroll-container" className="relative z-10 w-full h-full overflow-y-auto">
            {/* Mobile-only: Phase & Module indicator */}
            <MobilePhaseIndicator phases={phasesData} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
