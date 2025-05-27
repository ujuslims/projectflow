"use client";

import { ProjectsProvider } from '@/contexts/projects-context';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProjectsProvider>
      {children}
      <Toaster />
    </ProjectsProvider>
  );
}
