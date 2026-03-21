'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Course } from './CourseCard';

interface DeleteCourseModalProps {
  courseToDelete: Course | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCourseModal({
  courseToDelete,
  onClose,
  onConfirm
}: DeleteCourseModalProps) {
  if (!courseToDelete) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }} 
        className="relative w-full max-w-md bg-white dark:bg-[#1C1F26] rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-white/5 p-8 text-center"
      >
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-heading font-bold mb-2 dark:text-white">Delete Course?</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Are you sure you want to delete <span className="text-slate-900 dark:text-slate-200 font-bold">&quot;{courseToDelete.title}&quot;</span>? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/25"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
