'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, MoreVertical, Pin, Trash2, Globe } from 'lucide-react';

const BACKGROUND_IMAGES = [
  "/course_background_1.png",
  "/course_background_2.png",
  "/course_background_3.png"
];

export function getRandomBackground(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BACKGROUND_IMAGES[hash % BACKGROUND_IMAGES.length];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  created_at: string;
  source_count?: number; 
  brand?: string;
  brandIcon?: string;
  bgImage?: string;
  isPinned?: boolean;
}

interface CourseCardProps {
  course: Course;
  menuPrefix: string;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onTogglePin: (id: string, currentStatus: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  showGlobe?: boolean;
  aspectRatio?: string; // e.g. 'aspect-square' or 'aspect-3/4'
}

export function CourseCard({
  course,
  menuPrefix,
  activeMenuId,
  setActiveMenuId,
  onTogglePin,
  onDelete,
  showGlobe = false,
  aspectRatio = 'aspect-square'
}: CourseCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuId = `${menuPrefix}-${course.id}`;
  const isMenuOpen = activeMenuId === menuId;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(isMenuOpen ? null : menuId);
  };

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link href={`/course/${course.id}`}>
        <div className={`group relative ${aspectRatio} rounded-3xl lg:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl dark:shadow-black/50 border border-transparent hover:border-blue-500/50 transition-all duration-500`}>
          <Image 
            src={getRandomBackground(course.id)} 
            alt={course.title} 
            fill 
            unoptimized 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />
          
          <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex items-center justify-between w-[calc(100%-32px)] lg:w-[calc(100%-48px)]">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center overflow-hidden shadow-xl">
                <BrainCircuit className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              {showGlobe && course.brand && course.level && (
                <div className="flex flex-col">
                  <span className="text-[9px] lg:text-[11px] font-bold text-white uppercase tracking-widest opacity-80">{course.brand}</span>
                  <h4 className="text-[10px] lg:text-xs font-bold text-white tracking-wide">{course.level} Journey</h4>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-2 lg:p-2.5 text-white/50 hover:text-white transition-all bg-white/10 backdrop-blur-md rounded-xl border border-white/10"
              >
                <MoreVertical className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              
              <AnimatePresence>
                {isMenuOpen && (
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
            </div>
          </div>
          
          <div className="absolute bottom-5 left-5 right-5 lg:bottom-8 lg:left-8 lg:right-8 text-white">
            <h3 className="text-lg lg:text-2xl font-heading font-bold leading-[1.2] mb-3 lg:mb-4 uppercase tracking-tight line-clamp-3 group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
            <div className={`flex ${showGlobe ? 'items-center gap-3 lg:gap-4' : 'flex-col'} text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300`}>
              <span>{mounted ? new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
              <div className={`flex items-center gap-1.5 lg:gap-2 ${showGlobe ? '' : 'mt-1.5 lg:mt-2'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span>{course.source_count} modules</span>
              </div>
            </div>
          </div>
          
          {showGlobe && (
            <div className="absolute bottom-5 right-5 lg:bottom-8 lg:right-8 p-2 lg:p-3.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-2xl">
              <Globe className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
