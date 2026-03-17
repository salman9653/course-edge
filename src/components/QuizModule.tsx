'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  History, 
  Calendar, 
  BarChart3,
  Eye
} from 'lucide-react';
import { useCourseStore } from '@/lib/store/useCourseStore';
import { db } from '@/lib/firebase/client';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface Attempt {
  id: string;
  score: number;
  passed: boolean;
  answers: number[];
  created_at: string;
  questions?: Question[];
}

const GENERATION_STEPS = [
  "Initializing AI engine...",
  "Analyzing phase content...",
  "Identifying key concepts...",
  "Drafting challenging questions...",
  "Synthesizing multiple choice options...",
  "Finalizing knowledge check..."
];

export function QuizModule({ 
  courseId, 
  phaseId, 
  moduleId,
  onNextModule
}: { 
  courseId: string, 
  phaseId: string, 
  moduleId: string,
  onNextModule?: () => void
}) {
  const { setQuizInProgress, unlockPhase } = useCourseStore();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [genStep, setGenStep] = useState(0);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [viewingAttempt, setViewingAttempt] = useState<Attempt | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  // Subscribe to attempts
  useEffect(() => {
    if (!courseId || !phaseId || !moduleId) return;
    
    const attemptsRef = collection(db, 'courses', courseId, 'phases', phaseId, 'quizzes');
    const q = query(attemptsRef, orderBy('created_at', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .filter(d => d.data().module_id === moduleId)
        .map(d => ({ id: d.id, ...d.data() } as Attempt));
      setAttempts(docs);
      if (docs.length > 0) setShowHistory(true);
    });

    return () => unsubscribe();
  }, [courseId, phaseId, moduleId]);

  // Generation steps animation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setGenStep((prev) => (prev + 1) % GENERATION_STEPS.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const startQuiz = async () => {
    setLoading(true);
    setQuizInProgress(true);
    setShowHistory(false);
    setViewingAttempt(null);
    setIsFinished(false);
    setCurrentQIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, phaseId, moduleId }),
      });
      const data = await res.json();
      if (data.quiz) {
        setQuestions(data.quiz);
      }
    } catch (e) {
      console.error('Failed to load quiz', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null); // Reset for next question
    
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    let correctCount = 0;
    finalAnswers.forEach((ans, i) => {
      if (ans === questions[i].correctAnswerIndex) correctCount++;
    });
    const scoreVal = (correctCount / questions.length) * 100;
    setScore(scoreVal);
    setIsFinished(true);
    setQuizInProgress(false);

    // Save attempt
    const resultDocId = `attempt_${Date.now()}`;
    const resultRef = doc(db, 'courses', courseId, 'phases', phaseId, 'quizzes', resultDocId);
    
    await setDoc(resultRef, {
      module_id: moduleId,
      score: scoreVal,
      passed: scoreVal >= 50,
      answers: finalAnswers,
      questions: questions, // Store questions with the attempt for later review
      created_at: new Date().toISOString()
    });

    if (scoreVal >= 50) {
      // Mark current quiz module as completed
      const moduleRef = doc(db, 'courses', courseId, 'phases', phaseId, 'modules', moduleId);
      await updateDoc(moduleRef, { is_completed: true });

      // Check if all quizzes in the current phase are passed to unlock next phase
      checkAndUnlockNextPhase();
    }
  };

  const checkAndUnlockNextPhase = async () => {
    try {
      const phasesRef = collection(db, 'courses', courseId, 'phases');
      const q = query(phasesRef, orderBy('order_index'));
      const snap = await getDocs(q);
      const currentPhaseDoc = snap.docs.find(d => d.id === phaseId);
      if (!currentPhaseDoc) return;
      
      const currentIndex = currentPhaseDoc.data().order_index;
      
      // Check if all quiz modules in this phase are completed
      const modsSnap = await getDocs(collection(db, 'courses', courseId, 'phases', phaseId, 'modules'));
      const allQuizzesPassed = modsSnap.docs
        .filter(d => d.data().type === 'quiz')
        .every(d => d.data().is_completed === true);

      if (allQuizzesPassed) {
        const nextPhaseDoc = snap.docs.find(d => d.data().order_index === currentIndex + 1);
        if (nextPhaseDoc) {
          await updateDoc(nextPhaseDoc.ref, { is_unlocked: true });
          unlockPhase(nextPhaseDoc.id);
        }
      }
    } catch (error) {
      console.error('Failed to check phase unlock:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
             <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 dark:text-white">Curating Your Quiz</h3>
        <AnimatePresence mode="wait">
          <motion.p 
            key={genStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-slate-500 dark:text-slate-400 font-medium"
          >
            {GENERATION_STEPS[genStep]}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  if (isFinished) {
    const passed = score >= 50;
    return (
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-10 rounded-[2.5rem] border text-center relative overflow-hidden",
            passed 
              ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20" 
              : "bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
          )}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            {passed ? <CheckCircle2 className="w-32 h-32" /> : <XCircle className="w-32 h-32" />}
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg",
              passed ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            )}>
              {passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            
            <h2 className="text-4xl font-heading font-bold mb-2 dark:text-white">
              {passed ? 'Quiz Passed!' : 'Requires Review'}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md">
              {passed 
                ? `Impressive work! You've successfully demonstrated your understanding with a score of ${Math.round(score)}%.`
                : `You scored ${Math.round(score)}%. Review the phase content and try again to unlock the next phase.`
              }
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={startQuiz}
                className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                Re-attempt (New Questions)
              </button>
              
              {passed ? (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const latestAttempt = attempts[0];
                      if (latestAttempt) setViewingAttempt(latestAttempt);
                      setIsFinished(false);
                    }}
                    className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    View Details
                  </button>
                  {onNextModule && (
                    <button 
                      onClick={onNextModule}
                      className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      Next Module
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => {
                    const latestAttempt = attempts[0];
                    if (latestAttempt) setViewingAttempt(latestAttempt);
                    setIsFinished(false);
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                >
                  View Results
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (viewingAttempt) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setViewingAttempt(null)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Back to Attempts
          </button>
          <div className="flex items-center gap-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              viewingAttempt.passed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
            )}>
              {viewingAttempt.passed ? 'Passed' : 'Failed'}
            </span>
            <span className="text-sm font-bold dark:text-white">{Math.round(viewingAttempt.score)}% Score</span>
          </div>
        </div>

        <div className="space-y-6">
          {viewingAttempt.questions?.map((q, qIdx) => (
            <div key={qIdx} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1D24]">
              <div className="flex gap-4 mb-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold dark:text-white">
                  {qIdx + 1}
                </span>
                <div className="flex-1 prose prose-slate dark:prose-invert max-w-none prose-pre:bg-slate-900/90 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800 prose-code:text-blue-500 dark:prose-code:text-blue-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-blue-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {q.question}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctAnswerIndex;
                  const isUserAnswer = optIdx === viewingAttempt.answers[qIdx];
                  return (
                    <div 
                      key={optIdx}
                      className={cn(
                        "p-4 rounded-xl border text-sm transition-all",
                        isCorrect ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium" : 
                        isUserAnswer && !isCorrect ? "bg-red-50 dark:bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400 font-medium" :
                        "border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-pre:bg-slate-900/90 prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-800 prose-code:text-blue-500 dark:prose-code:text-blue-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-blue-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {opt}
                          </ReactMarkdown>
                        </div>
                        <div className="shrink-0 mt-0.5">
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const currentQ = questions[currentQIndex];
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {currentQIndex + 1} / {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentQIndex ? "w-8 bg-blue-500" : 
                    i < currentQIndex ? "w-4 bg-emerald-500" : "w-4 bg-slate-200 dark:bg-slate-800"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-slate-900/90 prose-pre:rounded-2xl prose-pre:border prose-pre:border-slate-800 prose-pre:shadow-2xl prose-code:text-blue-500 dark:prose-code:text-blue-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-blue-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentQ.question}
            </ReactMarkdown>
          </div>
        </div>

        <div className="space-y-4">
          {currentQ.options.map((opt, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedAnswer(idx)}
              className={cn(
                "w-full group relative text-left p-6 rounded-3xl border transition-all duration-300",
                selectedAnswer === idx 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-colors",
                  selectedAnswer === idx
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:text-blue-500"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className={cn(
                  "flex-1 prose dark:prose-invert max-w-none prose-p:my-0 transition-colors prose-pre:bg-slate-900/90 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800 prose-code:text-blue-500 dark:prose-code:text-blue-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-blue-300",
                  selectedAnswer === idx ? "prose-slate" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {opt}
                  </ReactMarkdown>
                </div>
                <div className={cn(
                  "ml-auto transition-opacity shrink-0",
                  selectedAnswer === idx ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                   <CheckCircle2 className={cn("w-5 h-5", selectedAnswer === idx ? "text-blue-500" : "text-slate-300")} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleAnswer}
            disabled={selectedAnswer === null}
            className={cn(
              "flex items-center gap-2 px-10 py-5 rounded-[1.5rem] font-bold transition-all active:scale-95 shadow-lg",
              selectedAnswer !== null
                ? "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            {currentQIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      <div className="bg-white dark:bg-[#1C1F26] p-10 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/10 dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full translate-x-32 -translate-y-32" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner">
            <BrainCircuit className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-heading font-bold mb-3 dark:text-white">
              Knowledge Check
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
              Validate your learning for this phase. You need at least 50% to unlock the next phase of your journey.
            </p>
          </div>
          <button 
            onClick={startQuiz}
            className="px-10 py-5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 whitespace-nowrap"
          >
            Start Quiz
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {attempts.length > 0 && showHistory && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-xl font-bold dark:text-white">Past Attempts</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attempts.map((attempt) => (
              <div 
                key={attempt.id}
                onClick={() => setViewingAttempt(attempt)}
                className="bg-white dark:bg-[#1A1D24] p-5 rounded-3xl border border-slate-200/60 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all flex items-center gap-4 group cursor-pointer hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  attempt.passed ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-red-50 dark:bg-red-500/10 text-red-500"
                )}>
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(attempt.score)}% Score</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      attempt.passed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    )}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(attempt.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button 
                  onClick={() => setViewingAttempt(attempt)}
                  className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
