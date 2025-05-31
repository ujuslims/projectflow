
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, LayoutDashboard, Brain, BarChartHorizontalBig } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-br from-background to-secondary/30 rounded-xl shadow-lg px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
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
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto"> {/* Constrains features section width and centers it */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground max-w-2xl mx-auto">
              Unlock Efficiency in Every Project Phase
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              ProjectFlow provides the tools you need to manage complex projects with ease and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<LayoutDashboard className="h-10 w-10 text-primary mb-4" />}
              title="Intuitive Project Management"
              description="Organize your projects with flexible stages and detailed subtasks. Our Kanban-style boards make it easy to visualize workflows and track progress from start to finish."
            />
            <FeatureCard
              icon={<Brain className="h-10 w-10 text-primary mb-4" />}
              title="AI-Powered Assistance"
              description="Leverage artificial intelligence to suggest relevant subtasks and organize your project plan, tailored for specialized industries like surveying and construction."
            />
            <FeatureCard
              icon={<BarChartHorizontalBig className="h-10 w-10 text-primary mb-4" />}
              title="Comprehensive Oversight"
              description="Gain clear insights with project timelines, financial summaries, and progress tracking. Make informed decisions and keep your projects on track and on budget."
            />
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="items-center">
        {icon}
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
