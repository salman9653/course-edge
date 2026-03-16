'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useCourseStore } from '@/lib/store/useCourseStore';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, updateDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export function QuizModal({ courseId, phaseId, moduleId, isOpen, onClose }: { courseId: string, phaseId: string, moduleId: string, isOpen: boolean, onClose: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const { unlockPhase } = useCourseStore();

  const fetchQuiz = async () => {
    setLoading(true);
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

  if (isOpen && questions.length === 0 && !loading) {
    fetchQuiz();
  }

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      newAnswers.forEach((ans, i) => {
        if (ans === questions[i].correctAnswerIndex) correctCount++;
      });
      const scoreVal = (correctCount / questions.length) * 100;
      setScore(scoreVal);
      setIsFinished(true);

      // Save to quizzes sub-collection inside the phase
      const resultDocId = moduleId.startsWith('main_quiz') ? 'main_quiz' : `quiz_${Date.now()}`;
      const resultRef = doc(db, 'courses', courseId, 'phases', phaseId, 'quizzes', resultDocId);
      
      setDoc(resultRef, {
        module_id: moduleId,
        score: scoreVal,
        passed: scoreVal >= 50,
        answers: newAnswers,
        created_at: new Date().toISOString()
      }).catch(console.error);

      if (scoreVal >= 50) {
        // Mark current quiz module as completed
        const moduleRef = doc(db, 'courses', courseId, 'phases', phaseId, 'modules', moduleId);
        updateDoc(moduleRef, { is_completed: true }).catch(console.error);

        // Unlock next phase
        const unlockNextPhase = async () => {
          try {
            const phasesRef = collection(db, 'courses', courseId, 'phases');
            const q = query(phasesRef, orderBy('order_index'));
            const snap = await getDocs(q);
            const currentPhaseDoc = snap.docs.find(d => d.id === phaseId);
            if (!currentPhaseDoc) return;
            
            const currentIndex = currentPhaseDoc.data().order_index;
            const nextPhaseDoc = snap.docs.find(d => d.data().order_index === currentIndex + 1);
            
            if (nextPhaseDoc) {
              await updateDoc(nextPhaseDoc.ref, { is_unlocked: true });
              unlockPhase(nextPhaseDoc.id);
            }
          } catch (error) {
            console.error('Failed to unlock next phase:', error);
          }
        };
        unlockNextPhase();
      }
    }
  };

  const handleRetry = () => {
    setQuestions([]);
    setCurrentQIndex(0);
    setAnswers([]);
    setIsFinished(false);
    setScore(0);
    fetchQuiz();
  };

  const currentQ = questions[currentQIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p>Generating Assessment...</p>
              </div>
            ) : isFinished ? (
              <div className="p-8 flex flex-col items-center text-center gap-4">
                {score >= 50 ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                    <h2 className="text-2xl font-bold dark:text-white">Phase Complete!</h2>
                    <p className="text-slate-600 dark:text-slate-400">You scored {Math.round(score)}%. The next phase is unlocked.</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-500 mb-2" />
                    <h2 className="text-2xl font-bold dark:text-white">Review Needed</h2>
                    <p className="text-slate-600 dark:text-slate-400">You scored {Math.round(score)}%. You need 50% to unlock the next phase.</p>
                    <button 
                      onClick={handleRetry}
                      className="mt-4 px-6 py-2 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-full font-medium"
                    >
                      Retry with New Questions
                    </button>
                  </>
                )}
                <button 
                  onClick={onClose}
                  className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            ) : questions.length > 0 ? (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6 text-sm font-medium text-slate-500">
                  <span>Question {currentQIndex + 1} of {questions.length}</span>
                  <span>{Math.round((currentQIndex / questions.length) * 100)}% Complete</span>
                </div>
                <h3 className="text-xl font-semibold mb-6 dark:text-white">{currentQ.question}</h3>
                <div className="flex flex-col gap-3">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all dark:text-slate-300"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
