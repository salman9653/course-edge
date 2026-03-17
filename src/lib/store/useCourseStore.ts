import { create } from 'zustand';

interface CourseState {
  activeCourseId: string | null;
  activePhaseId: string | null;
  activeModuleId: string | null;
  unlockedPhases: string[];
  isQuizInProgress: boolean;
  setCourseData: (courseId: string, phaseId: string, moduleId: string, unlockedPhases: string[]) => void;
  unlockPhase: (phaseId: string) => void;
  setActiveModule: (phaseId: string, moduleId: string) => void;
  setQuizInProgress: (inProgress: boolean) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  activeCourseId: null,
  activePhaseId: null,
  activeModuleId: null,
  unlockedPhases: [],
  isQuizInProgress: false,
  setCourseData: (courseId, phaseId, moduleId, unlockedPhases) => set({ 
    activeCourseId: courseId, 
    activePhaseId: phaseId, 
    activeModuleId: moduleId,
    unlockedPhases
  }),
  unlockPhase: (phaseId) => set((state) => ({
    unlockedPhases: state.unlockedPhases.includes(phaseId) 
      ? state.unlockedPhases 
      : [...state.unlockedPhases, phaseId]
  })),
  setActiveModule: (phaseId, moduleId) => set({
    activePhaseId: phaseId,
    activeModuleId: moduleId
  }),
  setQuizInProgress: (inProgress) => set({ isQuizInProgress: inProgress })
}));
