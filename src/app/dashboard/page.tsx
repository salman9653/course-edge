'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Plus, 
  Sparkles, 
  List, 
  LayoutGrid, 
  Search, 
  MoreVertical,
  Globe,
  X,
  ChevronRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';

const MOCK_USER_ID = 'demo_user';

const GENERATION_STEPS = [
  "Analyzing topic...",
  "Collecting resources...",
  "Structuring phases...",
  "Finding best videos...",
  "Generating quizzes...",
  "Finalizing roadmap..."
];

const BACKGROUND_IMAGES = [
  "/course_background_1.png",
  "/course_background_2.png",
  "/course_background_3.png"
];

function getRandomBackground(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BACKGROUND_IMAGES[hash % BACKGROUND_IMAGES.length];
}

function GeneratingAnimation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle text slower (every 4.5s)
    const textInterval = setInterval(() => {
      setStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);

    // Smoother, independent progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Hold at 95% until finished
        const increment = Math.random() * 0.5; // Very slow crawl
        return Math.min(prev + increment, 95);
      });
    }, 200);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-white/5 border-t-blue-600 dark:border-t-blue-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)]"
          >
            <BrainCircuit className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </div>

      <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-4">
        AI is architecting...
      </h3>
      
      <div className="h-8 mb-12 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-slate-500 dark:text-slate-400 text-lg font-medium"
          >
            {GENERATION_STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden shadow-inner">
        <motion.div 
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  created_at: string;
  source_count?: number; 
  brand?: string;
  brandIcon?: string;
  bgImage?: string;
}

// 10 Dummy Featured Courses
const MOCK_FEATURED_ALL: Course[] = [
  { id: 'feat-1', title: 'Advanced Neural Architectures & LLMs', description: 'Deep dive into transformers', level: 'Advanced', created_at: '2026-03-10T00:00:00Z', source_count: 57, brand: 'AI Research Lab', bgImage: '/course_background_1.png' },
  { id: 'feat-2', title: 'Visual Design Systems for High-End Apps', description: 'Mastering modern UI', level: 'Intermediate', created_at: '2026-03-12T00:00:00Z', source_count: 24, brand: 'Design Weekly', bgImage: '/course_background_2.png' },
  { id: 'feat-3', title: 'The Future of Sustainable Green Tech', description: 'Eco-friendly computing', level: 'Beginner', created_at: '2026-03-14T00:00:00Z', source_count: 15, brand: 'Green Earth Foundation', bgImage: '/course_background_3.png' },
  { id: 'feat-4', title: 'Quantum Computing Fundamentals', description: 'Qubits and algorithms', level: 'Advanced', created_at: '2026-02-28T00:00:00Z', source_count: 42, brand: 'Physics Daily', bgImage: '/course_background_1.png' },
  { id: 'feat-5', title: 'Modern Real-time Data Streaming', description: 'Kafka and beyond', level: 'Intermediate', created_at: '2026-03-01T00:00:00Z', source_count: 36, brand: 'Cloud Master', bgImage: '/course_background_2.png' },
  { id: 'feat-6', title: 'Cybersecurity for AI Applications', description: 'Securing the future', level: 'Advanced', created_at: '2026-03-05T00:00:00Z', source_count: 19, brand: 'SecNet', bgImage: '/course_background_3.png' },
  { id: 'feat-7', title: 'Distributed Systems at Scale', description: 'Architecting for millions', level: 'Advanced', created_at: '2026-03-08T00:00:00Z', source_count: 65, brand: 'Open Source Dev', bgImage: '/course_background_1.png' },
  { id: 'feat-8', title: 'User Psychology in Product Growth', description: 'Behaviors and hooks', level: 'Beginner', created_at: '2026-03-09T00:00:00Z', source_count: 12, brand: 'Growth Hackers', bgImage: '/course_background_2.png' },
  { id: 'feat-9', title: 'Blockchain & Web3 Architecture', description: 'Decentralized future', level: 'Intermediate', created_at: '2026-03-11T00:00:00Z', source_count: 28, brand: 'NextWeb', bgImage: '/course_background_3.png' },
  { id: 'feat-10', title: 'Bio-Informatics & Genomics with AI', description: 'Decoding life', level: 'Advanced', created_at: '2026-03-13T00:00:00Z', source_count: 89, brand: 'BioTech News', bgImage: '/course_background_1.png' },
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
  
  // Generation State
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, FIREBASE_COLLECTIONS.COURSES), where('user_id', '==', MOCK_USER_ID));
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
    fetchCourses();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level, language, userId: MOCK_USER_ID }),
      });
      const data = await res.json();
      if (data.success) router.push(`/course/${data.courseId}`);
      else alert(data.error || 'Failed to generate course');
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
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
      await deleteDoc(doc(db, FIREBASE_COLLECTIONS.COURSES, courseToDelete.id));
      setCourses(courses.filter(c => c.id !== courseToDelete.id));
      setCourseToDelete(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFeatured = MOCK_FEATURED_ALL.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Determine what featured courses to display
  const displayFeatured = activeTab === 'All' ? filteredFeatured.slice(0, 4) : filteredFeatured;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0F12] text-slate-900 dark:text-[#E8EAED] transition-all pt-[80px]">
      

      {/* Toolbar: Full Width Alignment */}
      <div className="bg-[#F9FAFB]/50 dark:bg-[#0D0F12]/50 border-b border-slate-200/60 dark:border-[#202124] sticky top-[80px] z-40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between gap-8">
           {/* Tabs Aligned to Logo */}
           <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200/50 dark:border-white/5 flex-shrink-0">
             {['All', 'Featured courses'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                   activeTab === tab ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-[#E8EAED]'
                 }`}
               >
                 {tab}
               </button>
             ))}
           </div>

           {/* Search: Expanding Space */}
           <div className="relative flex-1 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search library..."
               className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
             />
           </div>

           {/* Action Buttons Aligned to Profile */}
           <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl p-1 border border-slate-200/50 dark:border-white/5">
                 <button onClick={() => setViewMode('grid')} className={`p-2 px-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('list')} className={`p-2 px-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="px-6 py-3 bg-white dark:bg-white text-slate-900 dark:text-slate-900 rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-[0.98] border border-[#202124]/5 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" /> Create new
              </button>
           </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-12 space-y-20 pb-48">
        
        {/* Featured Section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-heading font-medium tracking-tight text-slate-900 dark:text-[#E8EAED]">
              {activeTab === 'All' ? 'Featured courses' : 'Explore Featured Journey Library'}
            </h2>
          </div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayFeatured.map((course) => (
                <motion.div key={course.id} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Link href={`/course/${course.id}`}>
                    <div className="group relative aspect-3/4 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl dark:shadow-black/50 border border-transparent hover:border-blue-500/50 transition-all duration-500">
                      <Image src={getRandomBackground(course.id)} alt={course.title} fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />
                      <div className="absolute top-6 left-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white shadow-xl">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white uppercase tracking-widest opacity-80">{course.brand}</span>
                          <h4 className="text-xs font-bold text-white tracking-wide">{course.level} Journey</h4>
                        </div>
                      </div>
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h3 className="text-2xl font-heading font-bold leading-[1.2] mb-4 uppercase tracking-tight line-clamp-3 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                          <span>{mounted ? new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                          <span>{course.source_count} modules</span>
                        </div>
                      </div>
                      <div className="absolute bottom-8 right-8 p-3.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-2xl"><Globe className="w-5 h-5" /></div>
                    </div>
                  </Link>
                </motion.div>
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
                    <th className="pb-4 pt-2 font-bold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#202124]">
                  {displayFeatured.map((course) => (
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
                         <Globe className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mx-auto" />
                      </td>
                      <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase italic text-[10px]">Reader</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'All' && filteredFeatured.length > 4 && (
            <div className="flex justify-end mt-8">
               <button 
                onClick={() => setActiveTab('Featured courses')}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-200 dark:bg-[#1C1F26] border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#252a33] transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm"
               >
                 See all <ChevronRight className="w-3.5 h-3.5 opacity-70" />
               </button>
            </div>
          )}
        </section>

        {/* Recent Courses Section (Hidden in Featured Tab) */}
        {activeTab === 'All' && (
          <section>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-heading font-medium tracking-tight text-slate-900 dark:text-[#E8EAED]">Recent courses</h2>
            </div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div onClick={() => setIsModalOpen(true)} className="group flex flex-col items-center justify-center gap-6 bg-slate-100/40 dark:bg-[#1C1F26]/30 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] p-12 cursor-pointer hover:bg-white dark:hover:bg-[#1C1F26] transition-all hover:border-blue-500/50 shadow-inner hover:shadow-2xl">
                  <div className="w-20 h-20 bg-slate-200/50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl"><Plus className="w-10 h-10" /></div>
                  <span className="font-bold text-slate-600 dark:text-slate-200 text-lg">Create new course</span>
                </div>
                {loading ? [1,2,3].map(i => <div key={i} className="aspect-square rounded-[2.5rem] bg-slate-100 dark:bg-white/5 animate-pulse" />) : 
                  filteredCourses.map((course) => (
                    <motion.div key={course.id} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Link href={`/course/${course.id}`}>
                        <div className="group relative aspect-square rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl dark:shadow-black/50 border border-transparent hover:border-blue-500/50 transition-all duration-500">
                           <Image src={getRandomBackground(course.id)} alt={course.title} fill unoptimized className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />
                          <div className="absolute top-6 left-6 flex items-center justify-between w-[calc(100%-48px)]">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center overflow-hidden shadow-xl">
                              <BrainCircuit className="w-6 h-6 text-white" />
                            </div>
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === course.id ? null : course.id);
                                }}
                                className="p-2.5 text-white/50 hover:text-white transition-all bg-white/10 backdrop-blur-md rounded-xl border border-white/10"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              <AnimatePresence>
                                {activeMenuId === course.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-20"
                                  >
                                    <button 
                                      onClick={(e) => handleDeleteCourse(course.id, e)}
                                      className="w-full px-5 py-4 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-bold uppercase tracking-widest"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <div className="absolute bottom-8 left-8 right-8 text-white">
                            <h3 className="text-2xl font-heading font-bold leading-[1.2] mb-4 uppercase tracking-tight line-clamp-3 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                            <div className="flex flex-col text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                              <span>{mounted ? new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                <span>{course.source_count} modules</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
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
                               setActiveMenuId(activeMenuId === course.id ? null : course.id);
                             }}
                             className="p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-all"
                           >
                             <MoreVertical className="w-4 h-4" />
                           </button>
                           <AnimatePresence>
                             {activeMenuId === course.id && (
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                 exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                 className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-20"
                               >
                                 <button 
                                   onClick={(e) => handleDeleteCourse(course.id, e)}
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
                    <tr onClick={() => setIsModalOpen(true)} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer border-t border-dashed border-slate-200 dark:border-white/5">
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
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-2xl bg-white dark:bg-[#1C1F26] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/60 dark:border-white/5 p-16">
              {!generating && <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:rotate-90 bg-slate-100 dark:bg-white/5 rounded-2xl"><X className="w-6 h-6" /></button>}
              
              {generating ? (
                <GeneratingAnimation />
              ) : (
                <>
                  <div className="mb-12">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.2rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/40"><Plus className="w-8 h-8 text-white" /></div>
                    <h2 className="text-4xl font-heading font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Architect New Course</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Define a topic and let AI curate your personalized learning roadmap.</p>
                  </div>
                  <form onSubmit={handleGenerate} className="space-y-10">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 tracking-widest uppercase italic ml-1 opacity-70">Topic</label>
                      <div className="relative group">
                        <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 transition-transform group-focus-within:scale-125" />
                        <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Next.js for Flutter Developers" className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-xl font-medium" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 tracking-widest uppercase italic ml-1 opacity-70">Experience Level</label>
                      <div className="grid grid-cols-3 gap-5">
                        {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                          <button key={lvl} type="button" onClick={() => setLevel(lvl)} className={`py-5 rounded-2xl border-2 text-sm font-bold transition-all ${level === lvl ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] scale-[1.05]' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 hover:border-slate-400'}`}>{lvl}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 tracking-widest uppercase italic ml-1 opacity-70">Language</label>
                      <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-6 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg font-medium appearance-none"
                      >
                        <option value="English">English</option>
                      </select>
                    </div>
                    <div className="pt-6">
                      <button type="submit" disabled={generating || !topic} className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-heading font-bold text-xl transition-all shadow-[0_20px_40px_-5px_rgba(59,130,246,0.5)] flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98]">
                        <BrainCircuit className="w-7 h-7" /> Architect Journey
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {courseToDelete && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setCourseToDelete(null)} 
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
                  onClick={() => setCourseToDelete(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
