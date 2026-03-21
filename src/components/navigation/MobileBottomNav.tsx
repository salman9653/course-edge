'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Search, User as UserIcon, Zap, DollarSign, Info, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: 'Courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    name: 'Search',
    href: '/search',
    icon: Search,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
  },
];

const LANDING_NAV_ITEMS = [
  {
    name: 'Home',
    href: ROUTES.HOME,
    icon: Home,
  },
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    authRequired: true,
  },
  {
    name: 'Features',
    href: '#features',
    icon: Zap,
  },
  {
    name: 'Pricing',
    href: '#pricing',
    icon: DollarSign,
  },
  {
    name: 'About',
    href: '#about',
    icon: Info,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isLandingPage = pathname === ROUTES.HOME;

  // If not on landing page and no user, don't show anything
  if (!isLandingPage && !user) return null;

  const items = isLandingPage 
    ? LANDING_NAV_ITEMS.filter(item => !item.authRequired || user)
    : NAV_ITEMS;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-[#0D0F12]/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/10 z-50 flex items-center justify-around px-4 pb-safe">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 w-16"
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}>
               <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
