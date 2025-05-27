"use client";

import type { Subtask } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit3, Trash2, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SubtaskCardProps {
  subtask: Subtask;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, subtaskId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubtaskCard({ subtask, onDragStart, onEdit, onDelete }: SubtaskCardProps) {
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
        {subtask.suggestedDeadline && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <CalendarDays className="h-3 w-3 mr-1" />
            <span>Deadline: {format(parseISO(subtask.suggestedDeadline), 'MMM dd, yyyy')}</span>
          </div>
        )}
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
