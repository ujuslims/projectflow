
"use client";

import { ProjectsProvider } from '@/contexts/projects-context';
import { AuthProvider } from '@/contexts/auth-context'; // Import AuthProvider
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider> {/* Wrap ProjectsProvider with AuthProvider */}
      <ProjectsProvider>
        {children}
        <Toaster />
      </ProjectsProvider>
    </AuthProvider>
  );
}
