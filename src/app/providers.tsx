
"use client";

import { ProjectsProvider } from '@/contexts/projects-context';
import { AuthProvider } from '@/contexts/auth-context'; 
import { CurrencyProvider } from '@/contexts/currency-context'; // Import CurrencyProvider
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider> {/* Wrap AuthProvider with CurrencyProvider */}
      <AuthProvider> 
        <ProjectsProvider>
          {children}
          <Toaster />
        </ProjectsProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}
