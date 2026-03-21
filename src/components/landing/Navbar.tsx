'use client';

import { useState, useRef, useEffect } from 'react';

import { motion } from 'framer-motion';
import { BrainCircuit, LogOut, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/services/firebase-auth';
import { APP_NAME, ROUTES } from '@/lib/constants';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLandingPage = pathname === ROUTES.HOME;
  const isAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;
  const isDashboard = pathname.startsWith(ROUTES.DASHBOARD);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#F9FAFB]/80 dark:bg-[#0D0F12]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-[#202124]"
    >
      <div className="max-w-[1400px] mx-auto px-6 h-[80px] flex items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-3 group">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6 text-white" />
           </div>
           <span className="font-heading font-bold text-[22px] tracking-tight dark:text-white group-hover:text-blue-600 transition-colors">{APP_NAME}</span>
        </Link>
        
        <div className="flex items-center gap-6">
           {/* Section Links - Only on Landing Page */}
           {isLandingPage && (
             <div className="hidden md:flex items-center gap-8 mr-4">
                <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">Features</Link>
                <Link href="#pricing" className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">Pricing</Link>
                <Link href="#about" className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">About Us</Link>
                {user && (
                   <Link href={ROUTES.DASHBOARD} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wider">Dashboard</Link>
                )}
             </div>
           )}
           
           {(isLandingPage || isDashboard || isAuthPage) && (
             <div className="w-px h-6 bg-slate-200 dark:bg-white/10 hidden md:block"></div>
           )}

           <ThemeToggle />

           <div className="flex items-center gap-2 md:gap-4 ml-2">
              {isLandingPage && !user && (
                <>
                  <Link href={ROUTES.LOGIN} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider hidden md:block">
                    Login
                  </Link>
                  <Link href={ROUTES.REGISTER} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 border border-[#202124]/5">
                    Get Started
                  </Link>
                </>
              )}

              {isAuthPage && !user && (
                <Link 
                  href={pathname === ROUTES.LOGIN ? ROUTES.REGISTER : ROUTES.LOGIN} 
                  className="px-6 py-2.5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  {pathname === ROUTES.LOGIN ? 'Create Account' : 'Sign In'}
                </Link>
              )}

              {user && (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-0 md:gap-3 p-0 md:px-4 md:py-2 md:bg-slate-100 md:dark:bg-white/5 rounded-full md:border md:border-slate-200 md:dark:border-white/10 md:hover:bg-slate-200 md:dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 hidden md:inline">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#13151A] border border-slate-200 dark:border-[#202124] rounded-2xl shadow-2xl overflow-hidden z-50 py-2">
                       <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                             <UserIcon className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                             <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                               {user.displayName || 'Learner'}
                             </span>
                             <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                               {user.email}
                             </span>
                          </div>
                       </div>
                       
                       <div className="px-2">
                         <button 
                           onClick={handleLogout}
                           className="w-full text-left px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                         >
                           <LogOut className="w-4 h-4" />
                           Logout
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>
    </motion.nav>
  );
}
