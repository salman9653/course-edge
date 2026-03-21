'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { LandingCourseMockup } from './LandingCourseMockup';

export function HeroSection() {
  const { user } = useAuth();
  
  return (
    <section className="relative min-h-screen w-full flex items-center pt-20 pb-20 lg:pt-0 lg:pb-0 overflow-hidden bg-[#F9FAFB] dark:bg-[#0D0F12]">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-CURATED LEARNING PATHS</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[1.05]"
            >
              The End of <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Tutorial Hell
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mb-12 font-medium leading-relaxed"
            >
              Transform any skill prompt into a structured, AI-curated learning journey. Stop watching, start building with precision.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
            >
              <Link href={user ? ROUTES.DASHBOARD : ROUTES.REGISTER} className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-heading font-bold text-lg transition-all shadow-[0_20px_40px_-5px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 group active:scale-95">
                {user ? 'Go to dashboard' : 'Get Started'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!user && (
                <Link href="#features" className="w-full sm:w-auto px-8 py-5 bg-transparent text-slate-900 dark:text-white rounded-full font-heading font-bold text-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  View Demo
                </Link>
              )}
            </motion.div>
          </div>

          {/* Right Column: Visual Mockup */}
          <motion.div
             initial={{ opacity: 0, scale: 0.9, x: 50 }}
             animate={{ opacity: 1, scale: 1, x: 0 }}
             transition={{ duration: 1, delay: 0.4 }}
             className="relative hidden lg:block"
          >
             <LandingCourseMockup />
          </motion.div>

        </div>
      </div>
    </section>
  );
}


