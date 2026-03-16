'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export function CtaSection() {
  return (
    <section className="py-40 bg-blue-600 dark:bg-blue-900 relative z-10 overflow-hidden">
      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 bg-[url('/course_background_2.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/30 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-[1000px] mx-auto px-6 relative z-20 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-heading font-black tracking-tight text-white mb-8"
        >
          Stop searching.<br />Start learning.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-blue-100 font-medium mb-16 max-w-2xl mx-auto"
        >
          Join thousands of learners who have accelerated their careers by letting AI curate their perfect study guide.
        </motion.p>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
        >
          <Link href={ROUTES.REGISTER} className="inline-flex items-center justify-center gap-3 px-12 py-6 bg-white text-blue-600 rounded-full font-heading font-black text-xl hover:bg-slate-50 transition-all shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 group active:scale-95">
            Architect Your First Course <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="mt-8 text-blue-200 font-bold uppercase tracking-widest text-xs">
            No credit card required • Free explorer tier
          </div>
        </motion.div>
      </div>
    </section>
  );
}
