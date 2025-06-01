
"use client";

import { AppLayout } from '@/components/layout/app-layout'; // This will be provided by (protected)/layout.tsx
import { CreateProjectDialog } from '@/components/project/create-project-dialog';
import { ProjectCard } from '@/components/project/project-card';
import { useProjects } from '@/contexts/projects-context';
import { FolderOpen, PackageOpen, Hourglass, CheckCircle2, Briefcase, CalendarIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/types';
import { getYear, getMonth, format, parseISO, isValid } from 'date-fns';

type FilterStatus = 'all' | 'notStarted' | 'inProgress' | 'completed';

export default function ProjectsPage() {
  const { projects } = useProjects();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterYearMonth, setFilterYearMonth] = useState<string>('all');


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

  const availableYearMonths = useMemo(() => {
    if (!projects || projects.length === 0) return [{ value: 'all', label: 'All Time' }];
    
    const yearMonthsSet = new Set<string>();
    projects.forEach(p => {
      if (p.createdAt) {
        try {
          const date = parseISO(p.createdAt);
          if (isValid(date)) {
            const year = getYear(date);
            const month = getMonth(date); // 0-indexed
            yearMonthsSet.add(`${year}-${String(month + 1).padStart(2, '0')}`); // Format as YYYY-MM
          }
        } catch (e) {
          // console.warn("Invalid createdAt date for project:", p.name, p.createdAt);
        }
      }
    });

    if (yearMonthsSet.size === 0) return [{ value: 'all', label: 'All Time' }];

    const sortedYearMonths = Array.from(yearMonthsSet)
      .sort((a, b) => b.localeCompare(a)) // Sorts "YYYY-MM" descending (most recent first)
      .map(ym => {
        const [yearStr, monthNumStr] = ym.split('-');
        // Create a date object for formatting the label. Month is 0-indexed for Date constructor.
        const dateForLabel = new Date(parseInt(yearStr), parseInt(monthNumStr) - 1); 
        return {
          value: ym,
          label: format(dateForLabel, 'MMMM yyyy'),
        };
      });

    return [{ value: 'all', label: 'All Time' }, ...sortedYearMonths];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let tempProjects = projects;

    if (filterStatus !== 'all') {
      tempProjects = tempProjects.filter(p => {
        const status = p.status || ('Not Started' as ProjectStatus);
        if (filterStatus === 'notStarted') return status === 'Not Started';
        if (filterStatus === 'inProgress') return status === 'Planning' || status === 'In Progress';
        if (filterStatus === 'completed') return status === 'Completed';
        return true; 
      });
    }

    if (filterYearMonth !== 'all') {
      const [filterYearStr, filterMonthStr] = filterYearMonth.split('-');
      const targetYear = parseInt(filterYearStr);
      const targetMonth = parseInt(filterMonthStr) - 1; // Convert back to 0-indexed for comparison with getMonth()

      tempProjects = tempProjects.filter(p => {
        if (p.createdAt) {
          try {
            const projectDate = parseISO(p.createdAt);
            if (isValid(projectDate)) {
              return getYear(projectDate) === targetYear && getMonth(projectDate) === targetMonth;
            }
            return false;
          } catch (e) {
            return false; 
          }
        }
        return false; 
      });
    }
    return tempProjects;
  }, [projects, filterStatus, filterYearMonth]);

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
    <> 
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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
        {availableYearMonths.length > 1 && ( // Show if more than just "All Time"
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <Select value={filterYearMonth} onValueChange={setFilterYearMonth}>
              <SelectTrigger className="w-full sm:w-[220px]" id="year-month-filter">
                <SelectValue placeholder="Select month & year" />
              </SelectTrigger>
              <SelectContent>
                {availableYearMonths.map(ym => (
                  <SelectItem key={ym.value} value={ym.value}>{ym.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {availableYearMonths.length <= 1 && projects.length > 0 && ( // Only "All Time" is present
             <p className="text-sm text-muted-foreground">No specific months found for filtering.</p>
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
          <p className="text-muted-foreground mb-4">Try adjusting your status or date filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects
            .sort((a, b) => {
                const dateA = a.createdAt ? parseISO(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? parseISO(b.createdAt).getTime() : 0;
                return dateB - dateA;
             })
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      )}
    </>
  );
}
