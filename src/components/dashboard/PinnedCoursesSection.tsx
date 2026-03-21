'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Pin, MoreVertical, BrainCircuit, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseCard, Course } from './CourseCard';

interface PinnedCoursesSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  displayPinned: Course[];
  viewMode: 'grid' | 'list';
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onTogglePin: (id: string, currentPinStatus: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  mounted: boolean;
  totalPinnedCount: number;
}

export function PinnedCoursesSection({
  activeTab,
  setActiveTab,
  displayPinned,
  viewMode,
  activeMenuId,
  setActiveMenuId,
  onTogglePin,
  onDelete,
  mounted,
  totalPinnedCount
}: PinnedCoursesSectionProps) {
  const router = useRouter();

  if (!(activeTab === 'Pinned' || (activeTab === 'All' && displayPinned.length > 0))) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6 lg:mb-10">
        <h2 className="text-xl lg:text-2xl font-heading font-medium tracking-tight text-slate-900 dark:text-[#E8EAED]">
          {activeTab === 'All' ? 'Pinned courses' : 'Your Pinned Courses'}
        </h2>
        <Link href="/courses" className="text-xs lg:text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">
          Show all
        </Link>
      </div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {displayPinned.map((course) => (
            <CourseCard 
              key={course.id}
              course={course}
              menuPrefix="pinned"
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
              showGlobe={true}
              aspectRatio="aspect-3/4"
            />
          ))}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 border-b border-slate-200/60 dark:border-[#202124]">
                <th className="pb-4 pt-2 font-bold w-[45%]">Title</th>
                <th className="pb-4 pt-2 font-bold">Modules</th>
                <th className="pb-4 pt-2 font-bold">Created</th>
                <th className="pb-4 pt-2 font-bold text-center w-10"></th>
                <th className="pb-4 pt-2 font-bold text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#202124]">
              {displayPinned.map((course) => (
                <tr key={course.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/course/${course.id}`)}>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          <BrainCircuit className="w-3 h-3" />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{course.title}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{course.source_count} Modules</td>
                  <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{mounted ? new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</td>
                  <td className="py-4 text-center">
                    <Pin className="w-4 h-4 text-blue-500 mx-auto" />
                  </td>
                  <td className="py-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === `pinned-list-${course.id}` ? null : `pinned-list-${course.id}`);
                      }}
                      className="p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {activeMenuId === `pinned-list-${course.id}` && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 text-left"
                        >
                          <button 
                            onClick={(e) => onTogglePin(course.id, course.isPinned || false, e)}
                            className="w-full px-5 py-4 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-bold uppercase tracking-widest"
                          >
                            <Pin className="w-4 h-4" /> {course.isPinned ? 'Unpin' : 'Pin course'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'All' && totalPinnedCount > 4 && (
        <div className="flex justify-end mt-8">
          <button 
            onClick={() => setActiveTab('Pinned')}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-200 dark:bg-[#1C1F26] border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#252a33] transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm"
          >
            See all <ChevronRight className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      )}
    </section>
  );
}
