'use client';

import { motion } from 'framer-motion';
import { Check, X, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export function PricingSection() {
  return (
    <section id="pricing" className="min-h-screen flex items-center justify-center py-32 bg-[#F9FAFB] dark:bg-[#08090A] relative z-10 border-t border-slate-200/50 dark:border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            Start building your journeys for free. Upgrade when you need more power and advanced AI integrations.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-[#13151A] rounded-[2.5rem] p-12 border border-slate-200 dark:border-white/5 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Explorer</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Perfect for curious minds.</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-black text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-500 font-medium">/month</span>
            </div>
            
            <ul className="space-y-4 mb-10">
              {['3 generated courses per month', 'Standard AI models', 'Basic video curation', 'Community support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400"><Check className="w-3.5 h-3.5" /></div>
                  {feature}
                </li>
              ))}
              {['Advanced quizzes', 'Offline downloads'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-400 dark:text-slate-600 font-medium opacity-50">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400"><X className="w-3.5 h-3.5" /></div>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link href={ROUTES.REGISTER} className="block w-full py-4 text-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Get Started for Free
            </Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative bg-slate-900 dark:bg-[#1C1F26] rounded-[2.5rem] p-12 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20"><BrainCircuit className="w-32 h-32 text-blue-500" /></div>
            
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/30">Most Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Architect</h3>
              <p className="text-slate-400 font-medium mb-8">For serious lifelong learners.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white">$15</span>
                <span className="text-slate-400 font-medium">/month</span>
              </div>
              
              <ul className="space-y-4 mb-10">
                {['Unlimited course generation', 'Premium AI models (Gemini 2.5 Flash)', 'Advanced video & article curation', 'Dynamic smart assessments', 'Offline PWA downloads', 'Priority support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg"><Check className="w-3.5 h-3.5" /></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href={ROUTES.REGISTER} className="block w-full py-4 text-center rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-xl shadow-blue-500/20 active:scale-95">
                Upgrade to Architect
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
