
import type { Project, ProjectStatus } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, CalendarCheck2, Edit, Hourglass, InfoIcon, ListChecks, PackageOpen, DollarSign, Percent, XCircle, CalendarDays, Hash, UserCircle, MoreVertical, Trash2, FolderOpen } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { format as formatDate, parseISO, isValid } from 'date-fns';
import { useCurrency } from '@/contexts/currency-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  onDeleteRequest: (projectId: string) => void; // New prop for delete action
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
    'In Progress': 'default', 
    'On Hold': 'secondary', 
    'Completed': 'default', 
    'Cancelled': 'destructive',
};


export function ProjectCard({ project, onDeleteRequest }: ProjectCardProps) {
  const { selectedCurrency } = useCurrency();
  const subtaskCount = project.subtasks?.length || 0;
  const completedSubtasks = project.subtasks?.filter(st => st.status === 'Done').length || 0;
  const progressPercentage = subtaskCount > 0 ? Math.round((completedSubtasks / subtaskCount) * 100) : 0;

  const status = project.status || 'Not Started';
  const statusIcon = projectStatusIconsSm[status];
  const statusBadgeVariant = projectStatusColors[status];
  const isCompleted = status === 'Completed';


  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-grow min-w-0">
                <Briefcase className="h-6 w-6 text-primary flex-shrink-0" />
                <CardTitle className="text-xl leading-tight truncate" title={project.name}>{project.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project.id}`} className="flex items-center cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Open Project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteRequest(project.id)} 
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
         <Badge variant={statusBadgeVariant} className={cn(isCompleted ? "bg-green-600 text-white" : "", "capitalize text-xs px-2 py-1 w-fit")}>
            {statusIcon}
            <span className="ml-1.5">{status}</span>
        </Badge>
        {project.projectNumber && (
            <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Hash className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                <span>{project.projectNumber}</span>
            </div>
        )}
        <CardDescription className="h-12 overflow-hidden text-ellipsis text-sm pt-1">
          {project.description || "No scope of work provided."} 
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2.5 text-sm">
        <div className="text-muted-foreground flex items-center">
          <ListChecks className="h-4 w-4 mr-2 text-primary" />
          <span>{completedSubtasks} / {subtaskCount} tasks ({progressPercentage}%)</span>
        </div>
        {project.clientContact && (
           <div className="text-muted-foreground flex items-center">
             <UserCircle className="h-4 w-4 mr-2 text-primary" />
             <span className="truncate" title={project.clientContact}>Client: {project.clientContact}</span>
           </div>
        )}
        {project.dueDate && isValid(parseISO(project.dueDate)) && (
           <div className="text-muted-foreground flex items-center">
             <CalendarDays className="h-4 w-4 mr-2 text-primary" />
             <span>Due: {formatDate(parseISO(project.dueDate), 'MMM dd, yyyy')}</span>
           </div>
        )}
        {project.budget !== undefined && project.budget > 0 && (
          <div className="text-muted-foreground flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span>Budget: {formatCurrency(project.budget, selectedCurrency)}</span>
          </div>
        )}
         {(project.budget === undefined || project.budget === 0) && !project.dueDate && !project.clientContact && (
             <div className="text-muted-foreground flex items-center">
                <InfoIcon className="h-4 w-4 mr-2 text-muted-foreground/70" />
                <span>More details inside...</span>
            </div>
         )}
      </CardContent>
      <CardFooter>
        {/* "Open Project" button is now in the dropdown menu */}
        <p className="text-xs text-muted-foreground w-full text-center">
          Created: {project.createdAt ? formatDate(parseISO(project.createdAt), 'PP') : 'N/A'}
        </p>
      </CardFooter>
    </Card>
  );
}
