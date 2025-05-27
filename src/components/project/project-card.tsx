
import type { Project, ProjectStatus } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, CalendarCheck2, Edit, Hourglass, InfoIcon, ListChecks, PackageOpen, DollarSign, Percent, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils'; // Assuming we'll create/use this

interface ProjectCardProps {
  project: Project;
}

const projectStatusIconsSm: Record<ProjectStatus, JSX.Element | null> = {
    'Not Started': <PackageOpen className="h-3.5 w-3.5" />,
    'Planning': <Edit className="h-3.5 w-3.5" />,
    'In Progress': <Hourglass className="h-3.5 w-3.5" />,
    'On Hold': <InfoIcon className="h-3.5 w-3.5" />,
    'Completed': <CalendarCheck2 className="h-3.5 w-3.5" />,
    'Cancelled': <XCircle className="h-3.5 w-3.5" />,
};

const projectStatusColors: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'Not Started': 'secondary',
    'Planning': 'outline',
    'In Progress': 'default', // often blue/primary
    'On Hold': 'secondary', // yellow/orange like
    'Completed': 'default', // should be green-ish if primary is not green
    'Cancelled': 'destructive',
};


export function ProjectCard({ project }: ProjectCardProps) {
  const subtaskCount = project.subtasks?.length || 0;
  const completedSubtasks = project.subtasks?.filter(st => st.status === 'Done').length || 0;
  const progressPercentage = subtaskCount > 0 ? Math.round((completedSubtasks / subtaskCount) * 100) : 0;

  const status = project.status || 'Not Started';
  const statusIcon = projectStatusIconsSm[status];
  const statusBadgeVariant = projectStatusColors[status];
   // Special styling for Completed status if primary is not green
  const isCompleted = status === 'Completed';


  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary flex-shrink-0" />
                <CardTitle className="text-xl leading-tight">{project.name}</CardTitle>
            </div>
            <Badge variant={statusBadgeVariant} className={isCompleted ? "bg-green-600 text-white" : ""}>
                {statusIcon}
                <span className="ml-1.5">{status}</span>
            </Badge>
        </div>
        <CardDescription className="h-12 overflow-hidden text-ellipsis text-xs">
          {project.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="text-sm text-muted-foreground flex items-center">
          <ListChecks className="h-4 w-4 mr-2 text-primary" />
          <span>{completedSubtasks} / {subtaskCount} tasks ({progressPercentage}%)</span>
        </div>
        {project.budget !== undefined && project.budget > 0 && (
          <div className="text-sm text-muted-foreground flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span>Budget: {formatCurrency(project.budget)}</span>
          </div>
        )}
         {project.budget === undefined || project.budget === 0 && (
             <div className="text-sm text-muted-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground/70" />
                <span>No budget set</span>
            </div>
         )}
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
