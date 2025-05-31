
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace('/auth/login');
    }
  }, [auth.loading, auth.user, router]);

  if (auth.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (!auth.user) {
    // This might show briefly if the redirect in useEffect hasn't fired yet
    // or if there's an issue with the redirect.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // If authenticated, render the AppLayout with the children (protected content)
  return <AppLayout>{children}</AppLayout>;
}
