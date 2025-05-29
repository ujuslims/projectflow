
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useProjects } from '@/contexts/projects-context';
import { useToast } from '@/hooks/use-toast';
import type { Project, Stage, Subtask, SubtaskStatus } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowLeft, Printer, ListChecks, DollarSign, CalendarDays, User, Building, Hash, MapPin, Globe, Edit, Hourglass, PackageOpen, CalendarCheck2, XCircle, InfoIcon, Users2, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { format as formatDate, parseISO, isValid, differenceInCalendarDays } from 'date-fns';

const statusIconMapSmall: Record<SubtaskStatus, JSX.Element> = {
  'To Do': <ListChecks className="h-3.5 w-3.5" />,
  'In Progress': <Hourglass className="h-3.5 w-3.5" />,
  'Done': <CalendarCheck2 className="h-3.5 w-3.5 text-green-600" />,
  'Blocked': <XCircle className="h-3.5 w-3.5 text-red-600" />,
};


export default function ProjectSummaryPage() {
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

  const completedSubtasksCount = useMemo(() => {
    return project?.subtasks.filter(st => st.status === 'Done').length || 0;
  }, [project?.subtasks]);
  const totalSubtasksCount = project?.subtasks.length || 0;
  const taskProgressPercentage = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const remainingBudget = useMemo(() => {
    if (project?.budget === undefined) return undefined;
    return project.budget - (project.spent || 0);
  }, [project?.budget, project?.spent]);

  const sortedStages = useMemo(() => {
    if (!project?.stages) return [];
    return [...project.stages].sort((a, b) => a.order - b.order);
  }, [project?.stages]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <ListChecks className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading project summary...</p>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p>Project not found.</p>
        </div>
      </AppLayout>
    );
  }

  const projectStatusIcons: Record<Project['status'] & string, JSX.Element> = {
    'Not Started': <PackageOpen className="h-4 w-4" />,
    'Planning': <Edit className="h-4 w-4" />,
    'In Progress': <Hourglass className="h-4 w-4" />,
    'On Hold': <InfoIcon className="h-4 w-4" />,
    'Completed': <CalendarCheck2 className="h-4 w-4" />,
    'Cancelled': <XCircle className="h-4 w-4" />,
  };
  const currentStatusIcon = project.status ? projectStatusIcons[project.status] : <InfoIcon className="h-4 w-4" />;


  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Project Summary: {project.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project Board
            </Link>
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Summary
          </Button>
        </div>
      </div>
      
      {/* For print view, simpler header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold">Project Summary: {project.name}</h1>
        <p className="text-sm text-muted-foreground">Generated on: {formatDate(new Date(), 'PPP p')}</p>
      </div>

      <div className="space-y-6">
        <Card className="print:shadow-none print:border-0">
          <CardHeader>
            <CardTitle className="text-xl">Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div className="flex items-start"><Hash className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" /><div><strong>Project No.:</strong> {project.projectNumber || 'N/A'}</div></div>
            <div className="flex items-start"><User className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" /><div><strong>Client:</strong> {project.clientContact || 'N/A'}</div></div>
            <div className="flex items-start"><Building className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" /><div><strong>Site:</strong> {project.siteAddress || 'N/A'}</div></div>
            <div className="flex items-start"><Globe className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" /><div><strong>Coord. System:</strong> {project.coordinateSystem || 'N/A'}</div></div>
            <div className="flex items-start">{currentStatusIcon && React.cloneElement(currentStatusIcon, { className: "h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0"})}<div><strong>Status:</strong> {project.status || 'N/A'}</div></div>
            <div className="flex items-start"><CalendarDays className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" /><div><strong>Due Date:</strong> {project.dueDate && isValid(parseISO(project.dueDate)) ? formatDate(parseISO(project.dueDate), 'PPP') : 'N/A'}</div></div>
          </CardContent>
        </Card>

        {project.description && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader><CardTitle className="text-xl">Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{project.description}</p></CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="print:shadow-none print:border-0">
              <CardHeader><CardTitle className="text-xl">Financial Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Budget:</span> <span>{formatCurrency(project.budget)}</span></div>
                <div className="flex justify-between"><span>Amount Spent:</span> <span>{formatCurrency(project.spent)}</span></div>
                <Separator />
                <div className="flex justify-between font-semibold"><span>Remaining Budget:</span> <span>{formatCurrency(remainingBudget)}</span></div>
              </CardContent>
            </Card>
            <Card className="print:shadow-none print:border-0">
              <CardHeader><CardTitle className="text-xl">Progress Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Tasks Completed:</span> 
                  <span>{completedSubtasksCount} / {totalSubtasksCount}</span>
                </div>
                <Progress value={taskProgressPercentage} className="h-3" />
                <p className="text-right">{taskProgressPercentage}% Complete</p>
              </CardContent>
            </Card>
        </div>
        
        <Card className="print:shadow-none print:border-0">
          <CardHeader><CardTitle className="text-xl">Stages & Subtasks</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sortedStages.length > 0 ? sortedStages.map(stage => (
              <div key={stage.id} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                <h3 className="text-md font-semibold mb-2 text-primary">{stage.name}</h3>
                <ul className="space-y-2 pl-2">
                  {project.subtasks.filter(st => st.stageId === stage.id).sort((a,b) => a.order - b.order).map(subtask => (
                    <li key={subtask.id} className="text-sm p-2 rounded-md bg-muted/30 print:bg-transparent print:p-0 print:border-b print:border-dashed last:print:border-b-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-medium">{subtask.name}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1", 
                          subtask.status === 'Done' ? 'bg-green-100 text-green-700 print:bg-transparent print:text-green-700' :
                          subtask.status === 'Blocked' ? 'bg-red-100 text-red-700 print:bg-transparent print:text-red-700' :
                          subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-700 print:bg-transparent print:text-blue-700' :
                          'bg-gray-100 text-gray-700 print:bg-transparent print:text-gray-700'
                        )}>
                          {statusIconMapSmall[subtask.status || 'To Do']} {subtask.status || 'To Do'}
                        </span>
                      </div>
                      {subtask.description && <p className="text-xs text-muted-foreground mb-1 print:hidden">{subtask.description}</p>}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span><strong>Start:</strong> {subtask.startDate && isValid(parseISO(subtask.startDate)) ? formatDate(parseISO(subtask.startDate), 'PP') : 'N/A'}</span>
                        <span><strong>End:</strong> {subtask.endDate && isValid(parseISO(subtask.endDate)) ? formatDate(parseISO(subtask.endDate), 'PP') : 'N/A'}</span>
                        {subtask.fieldCrewLead && <span><UserCog className="inline h-3 w-3 mr-1"/><strong>Lead:</strong> {subtask.fieldCrewLead}</span>}
                        {subtask.assignedPersonnel !== undefined && <span><Users2 className="inline h-3 w-3 mr-1"/><strong>Personnel:</strong> {subtask.assignedPersonnel}</span>}
                      </div>
                    </li>
                  ))}
                  {project.subtasks.filter(st => st.stageId === stage.id).length === 0 && (
                    <p className="text-xs text-muted-foreground">No subtasks in this stage.</p>
                  )}
                </ul>
              </div>
            )) : <p className="text-sm text-muted-foreground">No stages defined for this project.</p>}
          </CardContent>
        </Card>

        {project.outcomeNotes && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader><CardTitle className="text-xl">Outcomes & Lessons Learned</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{project.outcomeNotes}</p></CardContent>
          </Card>
        )}
      </div>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: 0 !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:text-green-700 { color: #15803d !important; } /* Tailwind green-700 */
          .print\\:text-red-700 { color: #b91c1c !important; } /* Tailwind red-700 */
          .print\\:text-blue-700 { color: #1d4ed8 !important; } /* Tailwind blue-700 */
          .print\\:text-gray-700 { color: #374151 !important; } /* Tailwind gray-700 */
          .print\\:border-b { border-bottom-width: 1px !important; }
          .print\\:border-dashed { border-bottom-style: dashed !important; }
          .print\\:last\\:border-b-0:last-child { border-bottom-width: 0 !important; }
          .print\\:last\\:pb-0:last-child { padding-bottom: 0 !important; }
        }
      `}</style>
    </AppLayout>
  );
}

