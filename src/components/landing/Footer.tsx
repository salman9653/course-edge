'use client';

import { BrainCircuit, Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME, ROUTES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-[#050505] pt-24 pb-12 relative z-10 border-t border-slate-800 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href={ROUTES.HOME} className="flex items-center gap-3 mb-6 inline-flex">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
               </div>
               <span className="font-heading font-bold text-xl tracking-tight text-white">{APP_NAME}</span>
            </Link>
            <p className="text-slate-400 font-medium max-w-sm">
              The AI-powered architect for your lifelong learning journey. Generating structured curriculums from the world&apos;s knowledge.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-tight">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-slate-400 hover:text-white transition-colors font-medium">Features</Link></li>
              <li><Link href="#pricing" className="text-slate-400 hover:text-white transition-colors font-medium">Pricing</Link></li>
              <li><Link href="#about" className="text-slate-400 hover:text-white transition-colors font-medium">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-tight">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Terms of Service</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800 dark:border-white/10">
          <p className="text-slate-500 font-medium text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} {APP_NAME} Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Github className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
