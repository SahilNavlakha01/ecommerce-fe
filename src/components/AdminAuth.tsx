'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthCookie, clearAuthCookie } from '@/utils/auth';

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const { token } = getAuthCookie('admin');
      
      if (!token) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setIsLoading(false);
        return;
      }
      
      // Decode token and validate role
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.role !== 3) {
          clearAuthCookie('admin');
          router.push('/admin/login');
          setIsLoading(false);
          return;
        }
        
        if (pathname === '/admin/login') {
          router.push('/admin');
          return;
        }
        
        setIsAuthenticated(true);
      } catch {
        clearAuthCookie('admin');
        router.push('/admin/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
