
"use client";

import Link from 'next/link';
import { ProjectFlowLogo } from '@/components/icons/project-flow-logo';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOutUser, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/'); // Redirect to homepage after sign out
    } catch (error) {
      console.error("Sign out error:", error);
      // Optionally show a toast notification for sign out error
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" aria-label="ProjectFlow Home">
            <ProjectFlowLogo />
          </Link>
          <nav className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                {/* <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span> */}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">
                    <LogIn className="mr-0 sm:mr-2 h-4 w-4" />
                     <span className="hidden sm:inline">Login</span>
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link href="/auth/signup">
                     <UserPlus className="mr-0 sm:mr-2 h-4 w-4" />
                     <span className="hidden sm:inline">Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 container max-w-screen-2xl py-8">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for project planning. &copy; {new Date().getFullYear()} ProjectFlow.
          </p>
        </div>
      </footer>
    </div>
  );
}
