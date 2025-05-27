"use client";

import Link from 'next/link';
import { ProjectFlowLogo } from '@/components/icons/project-flow-logo';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  showCreateButton?: boolean;
  onCreateProject?: () => void;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/projects" className="flex items-center space-x-2" aria-label="ProjectFlow Home">
            <ProjectFlowLogo />
          </Link>
          {/* Placeholder for future actions like User Profile / Settings */}
        </div>
      </header>
      <main className="flex-1 container max-w-screen-2xl py-8">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for project planning.
          </p>
        </div>
      </footer>
    </div>
  );
}
