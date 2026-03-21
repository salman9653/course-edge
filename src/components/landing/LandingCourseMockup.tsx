'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2 } from 'lucide-react';

export function LandingCourseMockup() {
  return (
    <div className="relative w-full max-w-[540px] ml-auto perspective-[2000px] pb-24 lg:pb-0">
       {/* Decorative behind elements - giving the glass something to blur */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-linear-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
       
       {/* 3D Container Wrapper with perspective */}
       <div style={{ perspective: '2000px' }} className="w-full h-full">
         <motion.div 
           initial={{ rotateX: 0, rotateY: 0, rotateZ: 0 }}
           animate={{ 
             rotateX: 25, 
             rotateY: -15, 
             rotateZ: 10, 
             y: [-5, 5, -5] 
           }}
           transition={{ 
             y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
             rotateX: { duration: 1.5, ease: "easeOut", delay: 0.2 },
             rotateY: { duration: 1.5, ease: "easeOut", delay: 0.2 },
             rotateZ: { duration: 1.5, ease: "easeOut", delay: 0.2 }
           }}
           style={{ transformStyle: 'preserve-3d' }}
           className="relative w-full h-full"
         >
           {/* Layer 2 (Bottom Shadow/Card) */}
           <div 
             className="absolute inset-0 bg-white/40 dark:bg-[#0D0F12]/60 backdrop-blur-3xl rounded-[3rem] border border-white/30 dark:border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:translate-z-[-80px]" 
             style={{ transform: 'translateZ(-40px) translateY(20px) translateX(20px)' }}
           />

           {/* Layer 1 (Top - Main Content - Glass Effect) */}
           <div 
             className="relative bg-white/70 dark:bg-[#13161A]/80 backdrop-blur-2xl rounded-[3rem] border border-white/50 dark:border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden p-8 flex flex-col gap-8 transform-gpu transition-all duration-500 hover:translate-z-[20px]"
             style={{ transform: 'translateZ(0px)' }}
           >
              {/* Mockup Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] dark:shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-500/30">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">Next.js for Flutter Developers</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">Roadmap generated in 14.2s</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-80">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                </div>
              </div>

              {/* Mockup Modules */}
              <div className="space-y-4">
                {/* Module 1 - Completed */}
                <div className="p-5 rounded-3xl bg-white/40 dark:bg-[#0D0F12]/50 border border-emerald-500/30 dark:border-emerald-500/20 relative group transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Module 01</span>
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                   </div>
                   <p className="text-sm font-bold text-slate-800 dark:text-white mb-4">State Management: Provider to Context</p>
                   <div className="w-full h-1.5 bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, delay: 1 }}
                        className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
                      />
                   </div>
                </div>

                {/* Module 2 - Active */}
                <div className="p-5 rounded-3xl bg-white/60 dark:bg-[#0D0F12]/80 border border-blue-500/40 dark:border-blue-500/30 relative overflow-hidden transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Module 02</span>
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Active</span>
                   </div>
                   <p className="text-sm font-bold text-slate-800 dark:text-white mb-4">Server Components vs Stateless Widgets</p>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '45%' }}
                          transition={{ duration: 1.5, delay: 1.5 }}
                          className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" 
                        />
                      </div>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">45%</span>
                   </div>
                </div>

                {/* Module 3 - Locked */}
                <div className="p-5 rounded-3xl bg-transparent border border-transparent opacity-40 grayscale mix-blend-luminosity">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Module 03</span>
                   <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide">Data Fetching & Hooks</p>
                </div>
              </div>
           </div>
         </motion.div>
       </div>
    </div>
  );
}
