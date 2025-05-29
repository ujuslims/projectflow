
"use client";

import type { Subtask, SubtaskStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit3, Trash2, CalendarDays, CheckCircle, Hourglass, ListChecks, XCircle, Users, MapPin, CalendarPlus, CalendarMinus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

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
  'Done': 'default', 
  'Blocked': 'destructive',
};


export function SubtaskCard({ subtask, onDragStart, onEdit, onDelete }: SubtaskCardProps) {
  const badgeVariant = statusColorMap[subtask.status || 'To Do'];
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
        <div className="flex flex-col gap-1.5 mb-2">
            {subtask.status && (
            <Badge variant={badgeVariant} className={cn("text-xs w-fit", isDone && "bg-primary text-primary-foreground")}>
                {statusIconMap[subtask.status]}
                <span className="ml-1">{subtask.status}</span>
            </Badge>
            )}
            {subtask.startDate && (
            <div className="flex items-center text-xs text-muted-foreground">
                <CalendarPlus className="h-3 w-3 mr-1.5 text-green-600" />
                <span>Start: {format(parseISO(subtask.startDate), 'MMM dd, yyyy')}</span>
            </div>
            )}
            {subtask.endDate && (
            <div className="flex items-center text-xs text-muted-foreground">
                <CalendarMinus className="h-3 w-3 mr-1.5 text-red-600" />
                <span>End: {format(parseISO(subtask.endDate), 'MMM dd, yyyy')}</span>
            </div>
            )}
             {subtask.assignedPersonnel !== undefined && subtask.assignedPersonnel > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1.5" />
                <span>{subtask.assignedPersonnel} {subtask.assignedPersonnel === 1 ? 'person' : 'people'}</span>
            </div>
            )}
            {subtask.location && (
            <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1.5" />
                <span>{subtask.location}</span>
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
