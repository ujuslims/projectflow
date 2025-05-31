
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, ListChecks, PieChart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
      <section className="py-12 md:py-20 lg:py-28 bg-gradient-to-br from-background to-secondary/30 rounded-xl shadow-lg">
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

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose ProjectFlow?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools designed for the unique needs of your industry.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<ListChecks className="h-8 w-8 text-primary" />}
              title="Intuitive Project Planning"
              description="Easily define stages, subtasks, and timelines. Visualize your project's progress at a glance."
              imageSrc="https://placehold.co/600x400.png"
              imageAlt="Project planning interface"
              aiHint="planning interface"
            />
            <FeatureCard
              icon={<Lightbulb className="h-8 w-8 text-primary" />}
              title="AI-Powered Suggestions"
              description="Leverage AI to suggest relevant subtasks and organize your project based on its scope."
              imageSrc="https://placehold.co/600x400.png"
              imageAlt="AI suggestion feature"
              aiHint="artificial intelligence"
            />
            <FeatureCard
              icon={<PieChart className="h-8 w-8 text-primary" />}
              title="Clear Reporting"
              description="Generate comprehensive project summaries perfect for client updates and internal reviews."
              imageSrc="https://placehold.co/600x400.png"
              imageAlt="Project report example"
              aiHint="report chart"
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
  imageSrc: string;
  imageAlt: string;
  aiHint: string;
}

function FeatureCard({ icon, title, description, imageSrc, imageAlt, aiHint }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative h-48 w-full">
        <Image 
          src={imageSrc} 
          alt={imageAlt} 
          layout="fill" 
          objectFit="cover" 
          data-ai-hint={aiHint}
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
