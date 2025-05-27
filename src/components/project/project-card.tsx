import type { Project } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const subtaskCount = project.subtasks?.length || 0;
  const stageCount = project.stages?.length || 0;

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">{project.name}</CardTitle>
        </div>
        <CardDescription className="h-16 overflow-hidden text-ellipsis">
          {project.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Stages: {stageCount}</p>
          <p>Subtasks: {subtaskCount}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" className="w-full">
          <Link href={`/projects/${project.id}`}>
            Open Project <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
