
"use client";

import type { Subtask, SubtaskStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit3, Trash2, CalendarDays, CheckCircle, Hourglass, ListChecks, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SubtaskCardProps {
  subtask: Subtask;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, subtaskId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusIconMap: Record<SubtaskStatus, JSX.Element> = {
  'To Do': <ListChecks className="h-3 w-3" />,
  'In Progress': <Hourglass className="h-3 w-3" />,
  'Done': <CheckCircle className="h-3 w-3" />,
  'Blocked': <XCircle className="h-3 w-3" />,
};

const statusColorMap: Record<SubtaskStatus, "default" | "secondary" | "destructive" | "outline"> = {
  'To Do': 'secondary',
  'In Progress': 'default',
  'Done': 'default', // Will be styled with primary color if 'default' badge is primary
  'Blocked': 'destructive',
};


export function SubtaskCard({ subtask, onDragStart, onEdit, onDelete }: SubtaskCardProps) {
  const badgeVariant = statusColorMap[subtask.status || 'To Do'];
  // For 'Done', if 'default' is primary, we might want a greenish badge or just rely on the icon.
  // Let's assume primary is a positive color for 'Done'.
  const isDone = subtask.status === 'Done';

  return (
    <Card 
      draggable 
      onDragStart={(e) => onDragStart(e, subtask.id)}
      className="mb-3 bg-card hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing"
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium break-words w-[calc(100%-40px)]">{subtask.name}</CardTitle>
          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {subtask.description && (
          <CardDescription className="text-xs mb-2 break-words">
            {subtask.description}
          </CardDescription>
        )}
        <div className="flex flex-wrap gap-2 items-center mb-2">
            {subtask.status && (
            <Badge variant={badgeVariant} className={cn("text-xs", isDone && "bg-primary text-primary-foreground")}>
                {statusIconMap[subtask.status]}
                <span className="ml-1">{subtask.status}</span>
            </Badge>
            )}
            {subtask.suggestedDeadline && (
            <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3 mr-1" />
                <span>{format(parseISO(subtask.suggestedDeadline), 'MMM dd, yyyy')}</span>
            </div>
            )}
        </div>
        <div className="flex justify-end space-x-2 mt-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} aria-label="Edit subtask">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete} aria-label="Delete subtask">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
