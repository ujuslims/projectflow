
"use client";

// AppLayout is now rendered by (protected)/layout.tsx
import { ProjectTimelineChart } from '@/components/project/project-timeline-chart';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/projects-context';
import { ArrowLeft, Loader2, ListChecks, Hourglass, CalendarCheck2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import type { Project, SubtaskStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format as formatDate, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';


const statusIcons: Record<SubtaskStatus, JSX.Element> = {
  'To Do': <ListChecks className="h-3.5 w-3.5" />,
  'In Progress': <Hourglass className="h-3.5 w-3.5" />,
  'Done': <CalendarCheck2 className="h-3.5 w-3.5" />,
  'Blocked': <XCircle className="h-3.5 w-3.5" />,
};


export default function ProjectTimelinePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { getProject } = useProjects();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (projectId) { 
      const currentProject = getProject(projectId);
      if (currentProject) {
        setProject(currentProject);
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        router.push('/projects');
      }
      setIsLoading(false);
    }
  }, [projectId, getProject, router, toast]); 

  const sortedSubtasksForTable = useMemo(() => {
    if (!project?.subtasks) return [];
    return [...project.subtasks].sort((a, b) => {
      const aDate = a.startDate ? parseISO(a.startDate).getTime() : Infinity;
      const bDate = b.startDate ? parseISO(b.startDate).getTime() : Infinity;
      if (aDate === bDate) {
        return a.order - b.order;
      }
      return aDate - bDate;
    });
  }, [project?.subtasks]);

  if (isLoading) { 
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading project timeline...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Project not found.</p>
      </div>
    );
  }
  
  const getStatusBadge = (status: SubtaskStatus = 'To Do') => {
    const icon = statusIcons[status];
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let className = "capitalize text-xs px-2 py-1";

    switch (status) {
      case 'Done':
        badgeVariant = "default"; // Will use primary, override with accent
        className = cn(className, "bg-accent text-accent-foreground hover:bg-accent/90");
        break;
      case 'In Progress':
        badgeVariant = "default"; // Uses primary color (teal)
        break;
      case 'Blocked':
        badgeVariant = "destructive";
        break;
      case 'To Do':
      default:
        badgeVariant = "secondary";
        break;
    }
    return (
      <Badge variant={badgeVariant} className={className}>
        {icon}
        <span className="ml-1.5">{status}</span>
      </Badge>
    );
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Timeline: {project.name}</h1>
        <Button asChild variant="outline">
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project Board
          </Link>
        </Button>
      </div>
      
      <ProjectTimelineChart subtasks={project.subtasks} projectName={project.name} />

      <Separator className="my-8" />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Activity List</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedSubtasksForTable.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Activity Name</TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead className="w-[150px]">Start Date</TableHead>
                  <TableHead className="w-[150px]">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubtasksForTable.map((subtask) => (
                  <TableRow key={subtask.id}>
                    <TableCell className="font-medium">{subtask.name}</TableCell>
                    <TableCell>{getStatusBadge(subtask.status)}</TableCell>
                    <TableCell>
                      {subtask.startDate && isValid(parseISO(subtask.startDate))
                        ? formatDate(parseISO(subtask.startDate), 'PP')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {subtask.endDate && isValid(parseISO(subtask.endDate))
                        ? formatDate(parseISO(subtask.endDate), 'PP')
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No subtasks to display in the list.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
