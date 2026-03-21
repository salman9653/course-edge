'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Video, GitBranch, CheckCircle2, Play, FileText, Check, Navigation } from 'lucide-react';

import { ModuleFeatureMockup } from './ModuleFeatureMockup';

export function FeaturesSection() {
  return (
    <section id="features" className="min-h-screen py-32 bg-white dark:bg-[#0D0F12] relative z-10 w-full overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 space-y-40">
        
        {/* Part 1: Designed for Mastery */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-4xl md:text-5xl font-heading font-black tracking-tight text-slate-900 dark:text-white mb-6"
            >
              Designed for Mastery
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed"
            >
              We don&apos;t just find videos. We build a curriculum tailored to your background, filling every knowledge gap along the way.
            </motion.p>
          </div>

          {/* Bento Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            
            {/* The Architect (col-span-1 to 5) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5 bg-blue-50/50 dark:bg-[#1C1F26] rounded-[2.5rem] p-10 2xl:p-12 border border-blue-100/50 dark:border-white/5 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-8 shadow-sm">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Architect</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Generates custom roadmaps with specific modules and objectives based on your current stack.
                </p>
              </div>
            </motion.div>

            {/* The Curator (col-span-1 to 7) */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="md:col-span-7 bg-blue-50/50 dark:bg-[#1C1F26] rounded-[2.5rem] p-10 2xl:p-12 border border-blue-100/50 dark:border-white/5 flex overflow-hidden relative group"
            >
               <div className="relative z-10 max-w-lg">
                 <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-8 shadow-sm">
                   <Video className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Curator</h3>
                 <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                   Deep YouTube integration scans transcripts and comments to find the most accurate, high-retention videos for every single concept.
                 </p>
               </div>
               {/* Decorative Video Icon */}
               <div className="absolute -right-6 -bottom-6 w-32 h-32 md:w-48 md:h-48 pointer-events-none group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700 opacity-[0.08] dark:invert dark:opacity-[0.05]">
                  <Image src="/youtube.svg" alt="YouTube Watermark" width={192} height={192} className="w-full h-full object-contain" aria-hidden="true" />
               </div>
            </motion.div>

            {/* The Bridge (col-span-1 to 7) */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="md:col-span-7 bg-indigo-50/50 dark:bg-[#1C1F26] rounded-[2.5rem] p-10 2xl:p-12 border border-indigo-100/50 dark:border-white/5"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-8 shadow-sm">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Bridge</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                AI-generated notes fill the silent gaps between videos. If a library has been updated since the video was filmed, the Bridge warns you and provides the new code.
              </p>
            </motion.div>

            {/* Smart Assessment (col-span-1 to 5) */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="md:col-span-5 bg-slate-900 dark:bg-[#111418] rounded-[2.5rem] p-10 2xl:p-12 border border-slate-800 dark:border-white/10 shadow-2xl dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-8">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Assessment</h3>
              <p className="text-slate-300 font-medium leading-relaxed">
                Dynamic quizzes generated from the actual video content. No moving forward until you&apos;ve proven you&apos;ve mastered the module.
              </p>
            </motion.div>

          </div>
        </div>

        {/* Part 2: Focus on what matters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center bg-slate-50/50 dark:bg-transparent rounded-[3rem] p-6 md:p-10 relative">
          
          {/* Left Side Mockup (Tablet/Desktop Only) */}
          <div className="hidden md:block">
            <ModuleFeatureMockup />
          </div>

          {/* Right Side Copy */}
          <div className="flex flex-col relative z-20">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-3xl md:text-5xl lg:text-[56px] font-heading font-black tracking-tighter text-slate-900 dark:text-white mb-10 md:mb-16 leading-[1.1] md:leading-[1.05]"
             >
               Focus on what matters. <br className="hidden sm:block" />
               <span className="text-blue-600 dark:text-blue-500">Skip the fluff.</span>
             </motion.h2>

             <div className="space-y-8 md:space-y-10">
                {/* Item 1 */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-4 md:gap-6"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#d1fae5] dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                     <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-[19px] font-bold text-slate-900 dark:text-white mb-1 md:mb-2 text-[clamp(1.1rem, 2vw, 1.25rem)]">Zero Redundancy</h4>
                    <p className="text-sm md:text-[15px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
                      Our AI scans for overlapping content across videos and trims the fat, saving you hours every week.
                    </p>
                  </div>
                </motion.div>

                {/* Item 2 */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-4 md:gap-6"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#d1fae5] dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                     <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-[19px] font-bold text-slate-900 dark:text-white mb-1 md:mb-2">Always Up to Date</h4>
                    <p className="text-sm md:text-[15px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
                      Software moves fast. We automatically check for breaking changes in the libraries you&apos;re learning.
                    </p>
                  </div>
                </motion.div>

                {/* Item 3 */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4 md:gap-6"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#d1fae5] dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                     <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-[19px] font-bold text-slate-900 dark:text-white mb-1 md:mb-2">Active Recall Built-in</h4>
                    <p className="text-sm md:text-[15px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
                      Every module ends with a project or a quiz to ensure you&apos;re actually learning, not just watching.
                    </p>
                  </div>
                </motion.div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
