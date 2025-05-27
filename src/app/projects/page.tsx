"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { CreateProjectDialog } from '@/components/project/create-project-dialog';
import { ProjectCard } from '@/components/project/project-card';
import { useProjects } from '@/contexts/projects-context';
import { FolderOpen } from 'lucide-react';

export default function ProjectsPage() {
  const { projects } = useProjects();

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No Projects Yet</h2>
          <p className="text-muted-foreground mb-4">Click on "New Project" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
