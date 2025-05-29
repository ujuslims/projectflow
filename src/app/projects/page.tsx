
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { CreateProjectDialog } from '@/components/project/create-project-dialog';
import { ProjectCard } from '@/components/project/project-card';
import { useProjects } from '@/contexts/projects-context';
import { FolderOpen, PackageOpen, Hourglass, CheckCircle2, Briefcase, CalendarIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/types';
import { getYear } from 'date-fns';

type FilterStatus = 'all' | 'notStarted' | 'inProgress' | 'completed';

export default function ProjectsPage() {
  const { projects } = useProjects();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  const projectCounts = useMemo(() => {
    const counts = {
      notStarted: 0,
      inProgress: 0,
      completed: 0,
      total: projects.length,
    };
    projects.forEach(p => {
      const status = p.status || 'Not Started';
      if (status === 'Not Started') {
        counts.notStarted++;
      } else if (status === 'Planning' || status === 'In Progress') {
        counts.inProgress++;
      } else if (status === 'Completed') {
        counts.completed++;
      }
    });
    return counts;
  }, [projects]);

  const availableYears = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const years = new Set<string>();
    projects.forEach(p => {
      if (p.createdAt) {
        try {
          years.add(getYear(new Date(p.createdAt)).toString());
        } catch (e) {
          // console.warn("Invalid date for project:", p.name, p.createdAt);
          // Potentially handle projects with invalid dates if necessary
        }
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort years descending
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let tempProjects = projects;

    // Filter by status
    if (filterStatus !== 'all') {
      tempProjects = tempProjects.filter(p => {
        const status = p.status || ('Not Started' as ProjectStatus);
        if (filterStatus === 'notStarted') return status === 'Not Started';
        if (filterStatus === 'inProgress') return status === 'Planning' || status === 'In Progress';
        if (filterStatus === 'completed') return status === 'Completed';
        return true; 
      });
    }

    // Filter by year
    if (filterYear !== 'all') {
      tempProjects = tempProjects.filter(p => {
        if (p.createdAt) {
          try {
            return getYear(new Date(p.createdAt)).toString() === filterYear;
          } catch (e) {
            return false; // Invalid date, don't include
          }
        }
        return false; // No createdAt date, don't include unless 'all years'
      });
    }
    return tempProjects;
  }, [projects, filterStatus, filterYear]);

  const StatCard = ({ title, count, icon: Icon, statusFilter, currentFilter, onClick }: {
    title: string;
    count: number;
    icon: React.ElementType;
    statusFilter: FilterStatus;
    currentFilter: FilterStatus;
    onClick: () => void;
  }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50",
        currentFilter === statusFilter ? "ring-2 ring-primary shadow-md bg-primary/5" : "bg-card"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
        <CreateProjectDialog />
      </div>

      <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="All Projects"
          count={projectCounts.total}
          icon={Briefcase}
          statusFilter="all"
          currentFilter={filterStatus}
          onClick={() => setFilterStatus('all')}
        />
        <StatCard
          title="Not Started"
          count={projectCounts.notStarted}
          icon={PackageOpen}
          statusFilter="notStarted"
          currentFilter={filterStatus}
          onClick={() => setFilterStatus('notStarted')}
        />
        <StatCard
          title="In Progress"
          count={projectCounts.inProgress}
          icon={Hourglass}
          statusFilter="inProgress"
          currentFilter={filterStatus}
          onClick={() => setFilterStatus('inProgress')}
        />
        <StatCard
          title="Completed"
          count={projectCounts.completed}
          icon={CheckCircle2}
          statusFilter="completed"
          currentFilter={filterStatus}
          onClick={() => setFilterStatus('completed')}
        />
      </div>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-card">
        <h2 className="text-md font-semibold text-card-foreground whitespace-nowrap">Filter by:</h2>
        {availableYears.length > 0 && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full sm:w-[180px]" id="year-filter">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {availableYears.length === 0 && projects.length > 0 && (
             <p className="text-sm text-muted-foreground">No specific years found for filtering.</p>
        )}
      </div>


      {projects.length === 0 ? (
         <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No Projects Yet</h2>
          <p className="text-muted-foreground mb-4">Click on "New Project" to get started.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No Projects Match Filters</h2>
          <p className="text-muted-foreground mb-4">Try adjusting your status or year filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      )}
    </AppLayout>
  );
}
