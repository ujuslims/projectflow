
"use client";

import type { Subtask, SubtaskStatus } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, differenceInCalendarDays, addDays } from 'date-fns';
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ProjectTimelineChartProps {
  subtasks: Subtask[];
  projectName: string;
}

interface ChartDataItem {
  id: string;
  name: string;
  range: [number, number]; // [startTimestamp, endTimestamp]
  status: SubtaskStatus;
  original: Subtask; // For tooltip
}

const statusColors: Record<SubtaskStatus, string> = {
  'To Do': '#A1A1AA', // Muted
  'In Progress': '#008080', // Primary
  'Done': '#6B8E23', // Accent
  'Blocked': '#EF4444', // Destructive
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: ChartDataItem = payload[0].payload; // The whole data item is in payload
    const originalSubtask = data.original;
    const startDate = originalSubtask.startDate ? format(parseISO(originalSubtask.startDate), 'PP') : 'N/A';
    const endDate = originalSubtask.endDate ? format(parseISO(originalSubtask.endDate), 'PP') : 'N/A';
    let durationText = 'N/A';
    if (originalSubtask.startDate && originalSubtask.endDate) {
      const diffDays = differenceInCalendarDays(parseISO(originalSubtask.endDate), parseISO(originalSubtask.startDate)) + 1;
      durationText = `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }

    return (
      <div className="bg-background p-3 border rounded shadow-lg text-sm">
        <p className="font-bold text-base mb-1">{originalSubtask.name}</p>
        <p><strong>Status:</strong> {originalSubtask.status || 'To Do'}</p>
        <p><strong>Start:</strong> {startDate}</p>
        <p><strong>End:</strong> {endDate}</p>
        <p><strong>Duration:</strong> {durationText}</p>
        {originalSubtask.assignedPersonnel !== undefined && (
          <p><strong>Personnel:</strong> {originalSubtask.assignedPersonnel}</p>
        )}
        {originalSubtask.location && (
          <p><strong>Location:</strong> {originalSubtask.location}</p>
        )}
      </div>
    );
  }
  return null;
};


export function ProjectTimelineChart({ subtasks, projectName }: ProjectTimelineChartProps) {
  const preparedData = useMemo(() => {
    const validSubtasks = subtasks.filter(st => st.startDate && st.endDate);
    return validSubtasks.map(st => {
      const sDate = parseISO(st.startDate!);
      const eDate = parseISO(st.endDate!);
      return {
        id: st.id,
        name: st.name,
        range: [sDate.getTime(), eDate.getTime()] as [number, number],
        status: st.status || 'To Do',
        original: st,
      };
    });
  }, [subtasks]);

  const { projectMinTs, projectMaxTs } = useMemo(() => {
    if (preparedData.length === 0) {
      const now = new Date();
      return { projectMinTs: now.getTime(), projectMaxTs: addDays(now, 7).getTime() };
    }
    let minTs = preparedData[0].range[0];
    let maxTs = preparedData[0].range[1];
    preparedData.forEach(item => {
      if (item.range[0] < minTs) minTs = item.range[0];
      if (item.range[1] > maxTs) maxTs = item.range[1];
    });
     // Add padding if range is too small
    if (maxTs - minTs < 24 * 60 * 60 * 1000) { // Less than a day
        maxTs = minTs + 7 * 24 * 60 * 60 * 1000; // Pad to 7 days
    }

    return { projectMinTs: minTs, projectMaxTs: maxTs };
  }, [preparedData]);

  if (preparedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline: {projectName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No Subtasks with Dates</p>
          <p>Please add subtasks with both start and end dates to view the timeline.</p>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(300, preparedData.length * 45 + 100); // 45px per task + 100px for axes/margins

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Project Timeline: {projectName}</CardTitle>
      </CardHeader>
      <CardContent className="pr-8"> {/* Added padding for Y-axis labels */}
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={preparedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="20%" // Adds gap between bars of different categories (subtasks)
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              scale="time"
              domain={[projectMinTs, projectMaxTs]}
              tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM d')}
              stroke="hsl(var(--foreground))"
              tick={{ fontSize: 12 }}
              allowDuplicatedCategory={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={180} // Increased width for longer task names
              stroke="hsl(var(--foreground))"
              tick={{ fontSize: 12, width: 170, textOverflow: 'ellipsis' }}
              interval={0} // Show all task names
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}/>
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="range" minPointSize={5} legendType="none">
              {preparedData.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={statusColors[entry.status] || statusColors['To Do']} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
