
"use client";

// AppLayout is now rendered by (protected)/layout.tsx
import { ProjectTimelineChart } from '@/components/project/project-timeline-chart';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/projects-context';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// import { useAuth } from '@/contexts/auth-context'; // Protection handled by (protected)/layout.tsx

export default function ProjectTimelinePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { getProject } = useProjects();
  const { toast } = useToast();
  // const { user, loading: authLoading } = useAuth(); // Handled by (protected)/layout.tsx
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Page-specific loading

  // useEffect(() => { // Protection handled by (protected)/layout.tsx
  //   if (!authLoading && !user) {
  //     router.replace('/auth/login');
  //   }
  // }, [user, authLoading, router]);

  useEffect(() => {
    if (projectId) { // && user
      const currentProject = getProject(projectId);
      if (currentProject) {
        setProject(currentProject);
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        router.push('/projects');
      }
      setIsLoading(false);
    }
  }, [projectId, getProject, router, toast]); // user removed from deps

  // if (authLoading) { // Handled by (protected)/layout.tsx
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  if (isLoading) { // Page-specific loading
    return (
      // AppLayout is rendered by (protected)/layout.tsx
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading project timeline...</p>
      </div>
    );
  }

  if (!project) {
    return (
      // AppLayout is rendered by (protected)/layout.tsx
      <div className="flex items-center justify-center h-full">
        <p>Project not found.</p>
      </div>
    );
  }

  return (
    // AppLayout is rendered by (protected)/layout.tsx
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Timeline: {project.name}</h1>
        <Button asChild variant="outline">
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project Board
          </Link>
        </Button>
      </div>
      
      <ProjectTimelineChart subtasks={project.subtasks} projectName={project.name} />
    </>
  );
}
