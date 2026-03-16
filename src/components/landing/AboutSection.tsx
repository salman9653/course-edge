'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

export function AboutSection() {
  return (
    <section id="about" className="min-h-screen flex items-center py-32 bg-white dark:bg-[#0D0F12] relative z-10 border-t border-slate-200/50 dark:border-white/5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl" />
            <div className="relative aspect-square rounded-[3rem] bg-slate-100 dark:bg-[#1C1F26] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-8 flex items-center justify-center">
               {/* Abstract conceptual image representation */}
               <div className="w-full h-full relative border border-white/5 rounded-[2rem] overflow-hidden">
                 <Image src="/course_background_1.png" alt="Abstract AI Mind" fill className="object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000" />
                 <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-10">
                    <p className="text-white font-heading font-medium text-2xl leading-relaxed">
                      &quot;Education shouldn&apos;t be one-size-fits-all. It should adapt to the mind that&apos;s absorbing it.&quot;
                    </p>
                 </div>
               </div>
            </div>
          </motion.div>

          <div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-slate-900 dark:text-white mb-8">
                Empowering the lifelong learner.
              </h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
                <p>
                  We built {APP_NAME} because the traditional methods of online learning are broken. Searching for videos, managing endless tabs, and losing track of progress is exhausting.
                </p>
                <p>
                  By harnessing the latest advancements in generative AI, we&apos;ve created a platform that acts as your personal curriculum architect. You provide the curiosity; we provide the structure.
                </p>
                <p>
                  Whether you&apos;re mastering quantum mechanics or learning modern web development, our goal is to eliminate the friction between you and your potential.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8 pt-12 border-t border-slate-200 dark:border-white/10">
                <div>
                  <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">10M+</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Curriculums Built</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">99.9%</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Knowledge Retention</div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
