'use client';
import { useRef } from 'react';
import { useCourseStore } from '@/lib/store/useCourseStore';

export function StoreInitializer({ 
  courseId, activePhaseId, activeModuleId, unlockedPhases 
}: { 
  courseId: string, activePhaseId: string, activeModuleId: string, unlockedPhases: string[] 
}) {
  const initialized = useRef(false);
  if (!initialized.current) {
    useCourseStore.getState().setCourseData(courseId, activePhaseId, activeModuleId, unlockedPhases);
    initialized.current = true;
  }
  return null;
}
