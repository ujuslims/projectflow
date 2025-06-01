
"use client";

// AppLayout is now rendered by (protected)/layout.tsx
// CreateProjectDialog is now in AppLayout
import { ProjectCard } from '@/components/project/project-card';
import { useProjects } from '@/contexts/projects-context';
import { FolderOpen, PackageOpen, Hourglass, CheckCircle2, Briefcase, CalendarIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/types';
import { getYear, getMonth, format, parseISO, isValid } from 'date-fns';

type FilterStatus = 'all' | 'notStarted' | 'inProgress' | 'completed';

const monthOptions = [
  { value: "all", label: "All Months" },
  { value: "0", label: "January" }, 
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

// Helper function to check if a date string matches the target year and optionally month
const dateMatchesFilter = (dateString: string | undefined, year: number, month?: number): boolean => {
    if (!dateString) return false;
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return false;
        
        const projectYear = getYear(date);
        const projectMonth = getMonth(date); // 0-indexed

        if (projectYear !== year) return false;
        // If month is undefined, we are only filtering by year, so return true if years match
        if (month === undefined) return true; 
        // If month is defined, it must also match
        if (projectMonth !== month) return false;
        
        return true;
    } catch (e) {
        return false;
    }
};


export default function ProjectsPage() {
  const { projects } = useProjects();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');


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

  const yearOptions = useMemo(() => {
    if (!projects || projects.length === 0) return [{ value: 'all', label: 'All Years' }];
    
    const yearsSet = new Set<number>();
    projects.forEach(p => {
      const datesToConsider: (string | undefined)[] = [p.createdAt, p.startDate, p.dueDate];
      datesToConsider.forEach(dateStr => {
        if (dateStr) {
          try {
            const date = parseISO(dateStr);
            if (isValid(date)) {
              yearsSet.add(getYear(date));
            }
          } catch (e) { /* ignore */ }
        }
      });
    });

    if (yearsSet.size === 0) return [{ value: 'all', label: 'All Years' }];

    const sortedYears = Array.from(yearsSet)
      .sort((a, b) => b - a) // Sort years descending
      .map(year => ({
          value: year.toString(),
          label: year.toString(),
        }));

    return [{ value: 'all', label: 'All Years' }, ...sortedYears];
  }, [projects]);

  useEffect(() => {
    if (selectedYear === 'all') {
      setSelectedMonth('all');
    }
  }, [selectedYear]);

  const filteredProjects = useMemo(() => {
    let tempProjects = projects;

    // Status Filter
    if (filterStatus !== 'all') {
      tempProjects = tempProjects.filter(p => {
        const status = p.status || ('Not Started' as ProjectStatus);
        if (filterStatus === 'notStarted') return status === 'Not Started';
        if (filterStatus === 'inProgress') return status === 'Planning' || status === 'In Progress';
        if (filterStatus === 'completed') return status === 'Completed';
        return true; 
      });
    }
    
    // Date Filter
    if (selectedYear !== 'all') {
      const targetYearNum = parseInt(selectedYear);
      const targetMonthNum = selectedMonth !== 'all' ? parseInt(selectedMonth) : undefined;

      tempProjects = tempProjects.filter(p => {
        // Prioritize startDate or dueDate if they exist
        if (p.startDate || p.dueDate) {
            const matchesStartDate = dateMatchesFilter(p.startDate, targetYearNum, targetMonthNum);
            const matchesDueDate = dateMatchesFilter(p.dueDate, targetYearNum, targetMonthNum);
            return matchesStartDate || matchesDueDate;
        } else {
            // Fallback to createdAt if no start or due date
            return dateMatchesFilter(p.createdAt, targetYearNum, targetMonthNum);
        }
      });
    }
    
    return tempProjects;
  }, [projects, filterStatus, selectedYear, selectedMonth]);

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
        {/* CreateProjectDialog has been moved to AppLayout */}
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
      
      {projects.length > 0 && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 p-4 border rounded-lg bg-card flex-wrap">
          <h2 className="text-md font-semibold text-card-foreground whitespace-nowrap mr-2">Filter by:</h2>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[160px]" id="year-filter">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(yo => (
                  <SelectItem key={yo.value} value={yo.value}>{yo.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={selectedYear === 'all'}>
              <SelectTrigger className="w-full sm:w-[190px]" id="month-filter">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(mo => (
                  <SelectItem key={mo.value} value={mo.value} disabled={selectedYear === 'all' && mo.value !== 'all'}>
                    {mo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}


      {projects.length === 0 ? (
         <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No Projects Yet</h2>
          <p className="text-muted-foreground mb-4">Click on "New Project" in the header to get started.</p>
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
                return dateB - dateA; // Sort descending by creation date
             })
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      )}
    </>
  );
}
