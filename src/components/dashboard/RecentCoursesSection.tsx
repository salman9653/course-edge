'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BrainCircuit, MoreVertical, Pin, Trash2 } from 'lucide-react';
import { CourseCard, Course } from './CourseCard';
import { useRouter } from 'next/navigation';

interface RecentCoursesSectionProps {
  activeTab: string;
  viewMode: 'grid' | 'list';
  filteredCourses: Course[];
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onTogglePin: (id: string, currentPinStatus: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onOpenCreateModal: () => void;
  loading: boolean;
  mounted: boolean;
}

export function RecentCoursesSection({
  activeTab,
  viewMode,
  filteredCourses,
  activeMenuId,
  setActiveMenuId,
  onTogglePin,
  onDelete,
  onOpenCreateModal,
  loading,
  mounted
}: RecentCoursesSectionProps) {
  const router = useRouter();

  if (activeTab !== 'All') return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6 lg:mb-10">
        <h2 className="text-xl lg:text-2xl font-heading font-medium tracking-tight text-slate-900 dark:text-[#E8EAED]">
          Recent courses
        </h2>
        <button onClick={onOpenCreateModal} className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
          <Plus className="w-3 h-3" /> Create new
        </button>
      </div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <div onClick={onOpenCreateModal} className="hidden md:flex group flex-col items-center justify-center gap-6 bg-slate-100/40 dark:bg-[#1C1F26]/30 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] p-12 cursor-pointer hover:bg-white dark:hover:bg-[#1C1F26] transition-all hover:border-blue-500/50 shadow-inner hover:shadow-2xl">
            <div className="w-20 h-20 bg-slate-200/50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl"><Plus className="w-10 h-10" /></div>
            <span className="font-bold text-slate-600 dark:text-slate-200 text-lg">Create new course</span>
          </div>
          {loading ? [1,2].map(i => <div key={i} className="aspect-square rounded-[2.5rem] bg-slate-100 dark:bg-white/5 animate-pulse" />) : 
            filteredCourses.slice(0, 2).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                menuPrefix="recent"
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onTogglePin={onTogglePin}
                onDelete={onDelete}
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
                <th className="pb-4 pt-2 font-bold">Role</th>
                <th className="pb-4 pt-2 font-bold text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#202124]">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/course/${course.id}`)}>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">{course.title}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{course.source_count} Modules</td>
                  <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{mounted ? new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</td>
                  <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-[10px]">Owner</td>
                  <td className="py-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === `recent-list-${course.id}` ? null : `recent-list-${course.id}`);
                      }}
                      className="p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {activeMenuId === `recent-list-${course.id}` && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-20"
                        >
                          <button 
                            onClick={(e) => onTogglePin(course.id, course.isPinned || false, e)}
                            className="w-full px-5 py-4 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/5"
                          >
                            <Pin className="w-4 h-4" /> {course.isPinned ? 'Unpin' : 'Pin course'}
                          </button>
                          <button 
                            onClick={(e) => onDelete(course.id, e)}
                            className="w-full px-5 py-4 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-bold uppercase tracking-widest"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
              {/* Inline Create Row for List View */}
              <tr onClick={onOpenCreateModal} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer border-t border-dashed border-slate-200 dark:border-white/5">
                <td className="py-4" colSpan={5}>
                  <div className="flex items-center gap-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:rotate-90 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Create new course...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
