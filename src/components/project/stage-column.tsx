
"use client";

import type { Stage, Subtask, SubtaskCore } from '@/lib/types';
import { SubtaskCard } from './subtask-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface StageColumnProps {
  stage: Stage;
  subtasks: Subtask[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>, stageId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stageId: string) => void;
  onSubtaskDragStart: (e: React.DragEvent<HTMLDivElement>, subtaskId: string) => void;
  onAddSubtask: () => void;
  onEditSubtask: (subtask: Subtask) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export function StageColumn({
  stage,
  subtasks,
  onDragOver,
  onDrop,
  onSubtaskDragStart,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask,
}: StageColumnProps) {
  return (
    <Card 
      className="w-80 flex-shrink-0 flex flex-col bg-secondary/20 shadow-sm"
      onDragOver={(e) => onDragOver(e, stage.id)}
      onDrop={(e) => onDrop(e, stage.id)}
    >
      <CardHeader className="p-4 border-b sticky top-0 bg-secondary/20 z-10">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg font-semibold">{stage.name}</CardTitle>
          {/* Stage actions (edit/delete) can be added here if needed */}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onAddSubtask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subtask
        </Button>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-4 space-y-1">
          {subtasks.sort((a,b) => a.order - b.order).map((subtask) => (
            <SubtaskCard
              key={subtask.id}
              subtask={subtask}
              onDragStart={onSubtaskDragStart}
              onEdit={() => onEditSubtask(subtask)}
              onDelete={() => onDeleteSubtask(subtask.id)}
            />
          ))}
          {subtasks.length === 0 && (
             <div className="text-center py-4 text-sm text-muted-foreground">
                Drag subtasks here or click above/below to add.
            </div>
          )}
        </CardContent>
      </ScrollArea>
      <div className="p-4 border-t mt-auto sticky bottom-0 bg-secondary/20">
        <Button variant="outline" className="w-full" onClick={onAddSubtask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subtask
        </Button>
      </div>
    </Card>
  );
}
