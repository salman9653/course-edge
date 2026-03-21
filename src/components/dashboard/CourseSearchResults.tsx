'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, BrainCircuit, MoreVertical, Pin, Trash2 } from 'lucide-react';
import { CourseCard, Course } from './CourseCard';
import { useRouter } from 'next/navigation';

interface CourseSearchResultsProps {
  searchQuery: string;
  filteredCourses: Course[];
  viewMode: 'grid' | 'list';
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onTogglePin: (id: string, currentPinStatus: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  mounted: boolean;
}

export function CourseSearchResults({
  searchQuery,
  filteredCourses,
  viewMode,
  activeMenuId,
  setActiveMenuId,
  onTogglePin,
  onDelete,
  mounted
}: CourseSearchResultsProps) {
  const router = useRouter();

  if (searchQuery.trim() === '') return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-heading font-medium tracking-tight text-slate-900 dark:text-[#E8EAED]">
          Search results <span className="text-slate-400 dark:text-slate-500 font-normal text-lg ml-2">for &ldquo;{searchQuery}&rdquo;</span>
        </h2>
        {filteredCourses.length > 0 && (
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{filteredCourses.length} found</span>
        )}
      </div>
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-6">
            <Search className="w-9 h-9" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No courses match &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-slate-400 dark:text-slate-600 text-sm mt-2">Try a different keyword</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              menuPrefix="search"
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
                  <td className="py-4 text-right relative">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === `search-list-${course.id}` ? null : `search-list-${course.id}`); }} className="p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {activeMenuId === `search-list-${course.id}` && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 text-left">
                          <button onClick={(e) => onTogglePin(course.id, course.isPinned || false, e)} className="w-full px-5 py-4 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/5">
                            <Pin className="w-4 h-4" /> {course.isPinned ? 'Unpin' : 'Pin course'}
                          </button>
                          <button onClick={(e) => onDelete(course.id, e)} className="w-full px-5 py-4 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-bold uppercase tracking-widest">
                            <Trash2 className="w-4 h-4" /> Delete
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
    </section>
  );
}
