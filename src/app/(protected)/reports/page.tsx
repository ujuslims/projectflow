
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/contexts/projects-context";
import { useCurrency } from "@/contexts/currency-context";
import { formatCurrency } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/types";
import { Briefcase, DollarSign, TrendingUp, Hourglass, CheckCircle2, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import React, { useMemo } from "react";

// Define a type for chart data
interface StatusChartData {
  status: ProjectStatus | "Total";
  count: number;
  fill: string; // For chart bar color
}

// Define colors for each status, using CSS variables for theme consistency
const statusColors: Record<ProjectStatus, string> = {
  'Not Started': 'hsl(var(--muted))', // Grayish
  'Planning': 'hsl(var(--chart-4))', // Yellowish/Orange from theme
  'In Progress': 'hsl(var(--primary))', // Primary theme color (Teal)
  'On Hold': 'hsl(var(--chart-5))', // Another distinct chart color
  'Completed': 'hsl(var(--accent))', // Accent theme color (Olive Green)
  'Cancelled': 'hsl(var(--destructive))', // Destructive theme color (Red)
};


export default function ReportsPage() {
  const { projects } = useProjects();
  const { selectedCurrency } = useCurrency();

  const projectStats = useMemo(() => {
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0); // spent is pre-calculated in context
    
    const statusCounts: Record<ProjectStatus, number> = {
      'Not Started': 0,
      'Planning': 0,
      'In Progress': 0,
      'On Hold': 0,
      'Completed': 0,
      'Cancelled': 0,
    };

    projects.forEach(p => {
      const currentStatus = p.status || 'Not Started'; // Default to 'Not Started' if undefined
      if (statusCounts.hasOwnProperty(currentStatus)) {
        statusCounts[currentStatus]++;
      }
    });
    
    const projectsInProgress = statusCounts['Planning'] + statusCounts['In Progress'];
    const projectsCompleted = statusCounts['Completed'];
    
    const chartData: StatusChartData[] = (Object.keys(statusCounts) as ProjectStatus[]).map(status => ({
      status: status,
      count: statusCounts[status],
      fill: statusColors[status] || 'hsl(var(--muted))', // Fallback fill
    })).filter(item => item.count > 0); // Only include statuses with one or more projects

    return {
      totalProjects,
      totalBudget,
      totalSpent,
      projectsInProgress,
      projectsCompleted,
      chartData,
    };
  }, [projects]);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <FileText className="mr-3 h-8 w-8 text-primary" />
          Reports Dashboard
        </h1>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard title="Total Projects" value={projectStats.totalProjects.toString()} icon={<Briefcase />} />
        <StatCard title="Total Budget" value={formatCurrency(projectStats.totalBudget, selectedCurrency)} icon={<DollarSign />} />
        <StatCard title="Total Spent" value={formatCurrency(projectStats.totalSpent, selectedCurrency)} icon={<TrendingUp />} />
        <StatCard title="Active Projects" value={projectStats.projectsInProgress.toString()} icon={<Hourglass />} description="(Planning & In Progress)" />
        <StatCard title="Completed Projects" value={projectStats.projectsCompleted.toString()} icon={<CheckCircle2 />} />
      </div>

      {/* Project Status Distribution Chart */}
      {projects.length > 0 && projectStats.chartData.length > 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] pr-6 pb-4"> {/* Ensure padding for axis labels */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={projectStats.chartData} 
                layout="vertical" 
                margin={{ top: 5, right: 20, left: 80, bottom: 20 }} // Increased left/bottom margin for labels
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--foreground))" allowDecimals={false} label={{ value: 'Number of Projects', position: 'insideBottom', offset: -10, style: { fill: 'hsl(var(--muted-foreground))', fontSize: '12px' } }} />
                <YAxis 
                  type="category" 
                  dataKey="status" 
                  stroke="hsl(var(--foreground))" 
                  width={100} // Width for Y-axis labels
                  tick={{ fontSize: 12 }} 
                  interval={0} // Ensure all labels are shown
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: 'var(--radius)',
                    boxShadow: 'hsl(var(--shadow))' 
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  formatter={(value: number, name: string, props: {payload: StatusChartData}) => [`${value} project(s)`, `Status: ${props.payload.status}`]}
                />
                <Bar dataKey="count" name="Projects" barSize={25} radius={[0, 4, 4, 0]}>
                  {projectStats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Project Status Distribution</CardTitle></CardHeader>
          <CardContent className="text-center py-10">
             <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-muted-foreground">
              No Project Data Available
            </h2>
            <p className="text-muted-foreground">
              Once you create projects and assign statuses, their distribution will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// Helper component for Stat Cards
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-muted-foreground" })}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

