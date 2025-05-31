
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is not loading and user exists
    if (!auth.loading && auth.user) {
      router.replace('/projects');
    }
  }, [auth.loading, auth.user, router]);

  // If auth is loading, or if user exists (and redirect will happen), show loader
  if (auth.loading || (!auth.loading && auth.user)) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  // If not loading and no user, show the actual homepage content
  return (
    <AppLayout>
      <section className="py-20 md:py-28 lg:py-36 bg-gradient-to-br from-background to-secondary/30 rounded-xl shadow-lg">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-primary">
              ProjectFlow
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground/80 sm:text-xl">
              Streamline Your Surveying, Geotechnical, and Construction Projects.
              Plan smarter, collaborate effectively, and deliver results with AI-powered insights.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* "Why Choose ProjectFlow?" section and FeatureCards removed as per request to focus on the hero section. */}
    </AppLayout>
  );
}
