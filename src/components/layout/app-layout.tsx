
"use client";

import Link from 'next/link';
import { ProjectFlowLogo } from '@/components/icons/project-flow-logo';
import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, UserPlus, Loader2, Settings2, Home, LayoutDashboard, FileText, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/currency-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CreateProjectDialog } from '@/components/project/create-project-dialog'; 
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOutUser, loading } = useAuth();
  const { selectedCurrency, setSelectedCurrency, availableCurrencies } = useCurrency();
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState(''); // Initialize currentPath state

  useEffect(() => {
    // Set currentPath only on the client side after mount
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);


  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/'); 
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: <Home /> },
    { href: '/projects', label: 'Dashboard', icon: <LayoutDashboard />, authRequired: true },
    { href: '/reports', label: 'Reports', icon: <FileText />, authRequired: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <Link href="/" className="flex items-center space-x-2 mr-6" aria-label="ProjectFlow Home">
            <ProjectFlowLogo />
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 flex-grow">
            {navItems.map((item) => {
              if (item.authRequired && !user && !loading) return null;
              if (item.authRequired && loading) return (
                <Button key={item.href} variant="ghost" size="sm" disabled className="text-muted-foreground">
                  {item.icon && React.cloneElement(item.icon, {className: "mr-0 sm:mr-2 h-4 w-4"})}
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    currentPath === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                    "justify-start"
                  )}
                >
                  <Link href={item.href}>
                     {item.icon && React.cloneElement(item.icon, {className: "mr-0 sm:mr-2 h-4 w-4"})}
                     <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
            {user && !loading && (
              <CreateProjectDialog 
                triggerButtonProps={{ 
                  variant: "ghost", 
                  size: "sm",
                  className: "justify-start text-primary"
                }}
                triggerButtonContent={
                  <>
                    <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Project</span>
                  </>
                }
              />
            )}
             {loading && ( 
                <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                    <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Project</span>
                </Button>
            )}
          </nav>
          
          <div className="flex items-center gap-2 ml-auto">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
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
          </div>
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
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="currency-select" className="text-sm text-muted-foreground sr-only">Currency:</Label>
            <Select
              value={selectedCurrency.code}
              onValueChange={(value) => setSelectedCurrency(value)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs" id="currency-select">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code} className="text-xs">
                    {currency.code} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </footer>
    </div>
  );
}
