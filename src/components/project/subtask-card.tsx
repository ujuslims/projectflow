
"use client";

import type { Subtask, SubtaskStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit3, Trash2, CalendarPlus, CalendarMinus, CheckCircle, Hourglass, ListChecks, XCircle, Users, MapPin, UserCog, Package, FileText } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
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

  const renderDetail = (Icon: React.ElementType, value?: string | number, labelPrefix?: string) => {
    if (!value && typeof value !== 'number') return null;
    return (
      <div className="flex items-start text-xs text-muted-foreground min-w-0">
        <Icon className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" />
        <span className="break-words min-w-0">{labelPrefix}{value}</span>
      </div>
    );
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, subtask.id)}
      className="bg-card hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing flex flex-col w-64 overflow-hidden" // Fixed width w-64
    >
      <CardHeader className="p-3 flex-shrink-0">
        {/* Added overflow-hidden to this div */}
        <div className="flex justify-between items-start gap-2 overflow-hidden"> 
          {/* Added whitespace-normal to CardTitle */}
          <CardTitle className="text-base font-medium break-words min-w-0 flex-grow whitespace-normal">
            {subtask.name}
          </CardTitle>
          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-1 flex flex-col justify-between">
        {/* Content (description and details) */}
        <div className="min-h-0"> 
          {subtask.description && (
            <CardDescription className="text-xs mb-2 break-words min-w-0">
              {subtask.description}
            </CardDescription>
          )}
          <div className="flex flex-col gap-1.5 mb-2">
            {subtask.status && (
            <Badge variant={badgeVariant} className={cn("text-xs w-fit", isDone && "bg-accent text-accent-foreground")}>
                {statusIconMap[subtask.status]}
                <span className="ml-1">{subtask.status}</span>
            </Badge>
            )}
            {subtask.startDate && isValid(parseISO(subtask.startDate)) && renderDetail(CalendarPlus, format(parseISO(subtask.startDate), 'MMM dd, yy'), 'Start: ')}
            {subtask.endDate && isValid(parseISO(subtask.endDate)) && renderDetail(CalendarMinus, format(parseISO(subtask.endDate), 'MMM dd, yy'), 'End: ')}
            {renderDetail(UserCog, subtask.fieldCrewLead, 'Lead: ')}
            {renderDetail(Users, subtask.assignedPersonnel, `${subtask.assignedPersonnel === 1 ? 'Person' : 'People'}: `)}
            {renderDetail(MapPin, subtask.location)}
            {renderDetail(Package, subtask.equipmentUsed, 'Equip: ')}
            {renderDetail(FileText, subtask.dataDeliverables, 'Deliver: ')}
          </div>
        </div>
        {/* Action Buttons - this will be pushed to the bottom by justify-between on CardContent */}
        <div className="flex justify-end space-x-1 pt-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} aria-label="Edit subtask">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            aria-label="Delete subtask"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
