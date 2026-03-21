'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { CourseCard, Course } from '@/components/dashboard/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0F12] pt-[120px] pb-32 px-6 max-w-[1400px] mx-auto text-slate-900 dark:text-[#E8EAED]">
      <h1 className="text-3xl font-heading font-medium tracking-tight mb-10">All Courses</h1>
      
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-slate-100 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No courses available. Start by creating one on the dashboard!</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              menuPrefix="courses"
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteCourse}
              aspectRatio="aspect-3/4"
              showGlobe={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
