'use client';

import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/services/firebase-auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0F12] pt-[120px] pb-32 px-6 max-w-[1400px] mx-auto text-slate-900 dark:text-[#E8EAED]">
      <h1 className="text-3xl font-heading font-medium tracking-tight mb-10">Profile Settings</h1>
      
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-xl mx-auto flex flex-col items-center shadow-xl">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
           <UserIcon className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-bold mb-1">{user.displayName || 'Learner'}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10">{user.email}</p>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-red-500/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500 transition-all font-bold text-lg"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
