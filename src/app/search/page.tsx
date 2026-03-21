'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { CourseCard, Course } from '@/components/dashboard/CourseCard';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, FIREBASE_COLLECTIONS.COURSES), where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(DOC => ({
          id: DOC.id,
          source_count: Math.floor(Math.random() * 20) + 5,
          ...DOC.data()
        })) as Course[];
        fetched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setCourses(fetched);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch('/api/delete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setCourses(courses.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleTogglePin = async (id: string, currentPinStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCourses(courses.map(c => c.id === id ? { ...c, isPinned: !currentPinStatus } : c));
    setActiveMenuId(null);
    try {
      const courseRef = doc(db, FIREBASE_COLLECTIONS.COURSES, id);
      await updateDoc(courseRef, { isPinned: !currentPinStatus });
    } catch (error) {
      setCourses(courses.map(c => c.id === id ? { ...c, isPinned: currentPinStatus } : c));
    }
  };

  if (!user) return null;

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0F12] pt-[120px] pb-32 px-6 max-w-[1400px] mx-auto text-slate-900 dark:text-[#E8EAED]">
      <div className="w-full relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search library..." 
          className="w-full pl-12 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" 
        />
      </div>
      
      {searchQuery.trim() === '' ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-5">
            <Search className="w-7 h-7" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Type to search from your courses</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-[2.5rem] bg-slate-100 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-6">
            <Search className="w-9 h-9" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No courses match &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              menuPrefix="searchpage"
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteCourse}
              aspectRatio="aspect-square"
            />
          ))}
        </div>
      )}
    </div>
  );
}
