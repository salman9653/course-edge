"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;
    const isDashboard = pathname.startsWith(ROUTES.DASHBOARD);

    if (user) {
      if (isAuthPage) {
        router.replace(ROUTES.DASHBOARD);
      }
    } else {
      if (isDashboard) {
        router.replace(ROUTES.HOME);
      }
    }
  }, [user, loading, pathname, router]);

  return { user, loading };
}
