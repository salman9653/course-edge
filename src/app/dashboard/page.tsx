'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { Course } from '@/components/dashboard/CourseCard';
import { DashboardToolbar } from '@/components/dashboard/DashboardToolbar';
import { CourseSearchResults } from '@/components/dashboard/CourseSearchResults';
import { PinnedCoursesSection } from '@/components/dashboard/PinnedCoursesSection';
import { RecentCoursesSection } from '@/components/dashboard/RecentCoursesSection';
import { CreateCourseModal } from '@/components/dashboard/CreateCourseModal';
import { DeleteCourseModal } from '@/components/dashboard/DeleteCourseModal';

const PLACEHOLDER_EXAMPLES = [
  "Advanced Data Structures in Python",
  "Introduction to Machine Learning",
  "Creative Writing for Beginners",
  "Space Exploration History",
  "Financial Independence Strategies",
  "Mastering UI Design Systems"
];

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isModalOpen && !generating && !generationError) {
      interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isModalOpen, generating, generationError]);

  // Auth and Navigation
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return; // Wait for user to be available

      try {
        const q = query(collection(db, FIREBASE_COLLECTIONS.COURSES), where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          source_count: Math.floor(Math.random() * 20) + 5,
          ...doc.data()
        })) as Course[];
        fetched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setCourses(fetched);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchCourses();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !user) return;
    setGenerating(true);
    setGenerationError(false);
    try {
      const res = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level, language, userId: user.uid }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/course/${data.courseId}`);
      } else {
        console.error('Course generation failed:', data.error);
        setGenerationError(true);
        setGenerating(false);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationError(true);
      setGenerating(false);
    }
  };

  const handleRetryGenerate = () => {
    setGenerationError(false);
    // Re-submit the form programmatically using the existing state
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleGenerate(fakeEvent);
  };

  const handleCloseModal = () => {
    if (!generating) {
      setIsModalOpen(false);
      setGenerationError(false);
    }
  };

  const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const course = courses.find(c => c.id === id);
    if (course) {
      setCourseToDelete(course);
      setActiveMenuId(null);
    }
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      const res = await fetch('/api/delete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseToDelete.id }),
      });

      const data = await res.json();
      if (data.success) {
        setCourses(courses.filter(c => c.id !== courseToDelete.id));
        setCourseToDelete(null);
      } else {
        throw new Error(data.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course: " + (error instanceof Error ? error.message : "Internal error"));
    }
  };

  const handleTogglePin = async (id: string, currentPinStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic update
    setCourses(courses.map(c => c.id === id ? { ...c, isPinned: !currentPinStatus } : c));
    setActiveMenuId(null);
    
    try {
      const courseRef = doc(db, FIREBASE_COLLECTIONS.COURSES, id);
      await updateDoc(courseRef, { isPinned: !currentPinStatus });
    } catch (error) {
      console.error("Error toggling pin status:", error);
      // Revert optimistic update on error
      setCourses(courses.map(c => c.id === id ? { ...c, isPinned: currentPinStatus } : c));
      alert("Failed to update pin status");
    }
  };

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPinned = courses.filter(c => c.isPinned && c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Determine what pinned courses to display
  const displayPinned = activeTab === 'All' ? filteredPinned.slice(0, 4) : filteredPinned;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0F12] text-slate-900 dark:text-[#E8EAED] transition-all pt-[80px]">
      
      <DashboardToolbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCreateModal={() => setIsModalOpen(true)}
      />

      <main className="max-w-[1400px] mx-auto px-6 py-12 space-y-20 pb-48">
        <CourseSearchResults 
          searchQuery={searchQuery}
          filteredCourses={filteredCourses}
          viewMode={viewMode}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          onTogglePin={handleTogglePin}
          onDelete={handleDeleteCourse}
          mounted={mounted}
        />

        {searchQuery.trim() === '' && (
          <>
            <PinnedCoursesSection 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              displayPinned={displayPinned}
              viewMode={viewMode}
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteCourse}
              mounted={mounted}
              totalPinnedCount={filteredPinned.length}
            />

            <RecentCoursesSection 
              activeTab={activeTab}
              viewMode={viewMode}
              filteredCourses={filteredCourses}
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteCourse}
              onOpenCreateModal={() => setIsModalOpen(true)}
              loading={loading}
              mounted={mounted}
            />
          </>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <CreateCourseModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            topic={topic}
            setTopic={setTopic}
            level={level}
            setLevel={setLevel}
            language={language}
            setLanguage={setLanguage}
            isLanguageDropdownOpen={isLanguageDropdownOpen}
            setIsLanguageDropdownOpen={setIsLanguageDropdownOpen}
            generating={generating}
            generationError={generationError}
            placeholderIndex={placeholderIndex}
            handleGenerate={handleGenerate}
            handleRetryGenerate={handleRetryGenerate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {courseToDelete && (
          <DeleteCourseModal 
            courseToDelete={courseToDelete}
            onClose={() => setCourseToDelete(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
