'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, Zap, Globe, Cpu, Layout, BookOpen } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-blue-500" />,
    title: 'AI-Generated Curriculum',
    description: 'Our proprietary models instantly generate structured courses from any topic, breaking down complex subjects into digestible modules.',
  },
  {
    icon: <Globe className="w-8 h-8 text-indigo-500" />,
    title: 'Curated Content Sourcing',
    description: 'Automatically pulls the best available videos, articles, and resources from across the web to populate your learning journey.',
  },
  {
    icon: <Zap className="w-8 h-8 text-amber-500" />,
    title: 'Smart Assessments',
    description: 'Dynamic quizzes generated on the fly ensure you actually comprehend the material before unlocking the next phase.',
  },
  {
    icon: <Cpu className="w-8 h-8 text-emerald-500" />,
    title: 'Adaptive Difficulty',
    description: 'Specify your experience level (Beginner to Advanced) and the AI tailors the depth and complexity of the content.',
  },
  {
    icon: <Layout className="w-8 h-8 text-purple-500" />,
    title: 'Premium Interface',
    description: 'Enjoy a sleek, distraction-free environment designed to keep you focused and engaged with your learning material.',
  },
  {
    icon: <BookOpen className="w-8 h-8 text-pink-500" />,
    title: 'Offline Capable',
    description: 'Download your course outlines and text-based bridge notes for access even when you drop off the grid.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="min-h-screen py-32 bg-white dark:bg-[#0D0F12] border-t border-slate-200/50 dark:border-white/5 relative z-10">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            A smarter way to build expertise
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            {APP_NAME} combines the power of large language models with curated public data to create the ultimate personalized learning experience.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-[#F9FAFB]/50 dark:bg-[#1C1F26]/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-[2rem] p-10 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-slate-200/50 dark:border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
