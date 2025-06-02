
"use client";

import type { Stage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit2, ListOrdered, GripVertical } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface DefineStagesProps {
  projectId: string; // Added projectId for context calls
  stages: Stage[];
  onAddStage: (name: string) => void;
  onUpdateStage: (id: string, name: string) => void;
  onDeleteStage: (id: string) => void;
  onReorderStages: (projectId: string, sourceStageId: string, targetStageId: string | null) => void;
}

export function DefineStages({ projectId, stages, onAddStage, onUpdateStage, onDeleteStage, onReorderStages }: DefineStagesProps) {
  const [newStageName, setNewStageName] = useState('');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageName, setEditingStageName] = useState('');
  const [dropTargetInfo, setDropTargetInfo] = useState<{ id: string | null; position: 'before' | 'after' | 'at-end' } | null>(null);


  const handleAddStage = (e: FormEvent) => {
    e.preventDefault();
    if (newStageName.trim()) {
      onAddStage(newStageName.trim());
      setNewStageName('');
    }
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStageId(stage.id);
    setEditingStageName(stage.name);
  };

  const handleSaveStageEdit = (e: FormEvent) => {
    e.preventDefault();
    if (editingStageId && editingStageName.trim()) {
      onUpdateStage(editingStageId, editingStageName.trim());
      setEditingStageId(null);
      setEditingStageName('');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, stageId: string) => {
    e.dataTransfer.setData('stageId', stageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, targetStageId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (targetStageId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isOverTopHalf = e.clientY < rect.top + rect.height / 2;
      setDropTargetInfo({ id: targetStageId, position: isOverTopHalf ? 'before' : 'after' });
    } else {
      // Dragging over the general list area (for dropping at end)
      setDropTargetInfo({ id: null, position: 'at-end' });
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    // Check if the mouse is truly leaving the element or just entering a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
       setDropTargetInfo(null);
    }
  };
  
  const handleDropOnStage = (e: React.DragEvent<HTMLLIElement>, currentTargetStageId: string) => {
    e.preventDefault();
    const sourceStageId = e.dataTransfer.getData('stageId');
    if (sourceStageId && sourceStageId !== currentTargetStageId) {
        // If dropping 'before' the target, targetId is currentTargetStageId
        // If dropping 'after' the target, we need to find the *next* stage's ID or null if it's the last
        let finalTargetId = currentTargetStageId;
        if (dropTargetInfo?.position === 'after') {
            const currentIdx = stages.findIndex(s => s.id === currentTargetStageId);
            finalTargetId = (currentIdx < stages.length - 1) ? stages[currentIdx + 1].id : null;
        }
      onReorderStages(projectId, sourceStageId, finalTargetId);
    }
    setDropTargetInfo(null);
  };

  const handleDropOnList = (e: React.DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const sourceStageId = e.dataTransfer.getData('stageId');
    if (sourceStageId) {
      onReorderStages(projectId, sourceStageId, null); // Null target means drop at end
    }
    setDropTargetInfo(null);
  };


  return (
    <Card className="mb-8 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-primary" />
          <CardTitle>Project Stages <span className="text-sm font-normal text-muted-foreground">(Drag to reorder)</span></CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddStage} className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            type="text"
            placeholder="Enter new stage name (e.g., To Do, In Progress)"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Stage
          </Button>
        </form>
        {stages.length > 0 ? (
          <ul 
            className="space-y-1"
            onDragOver={(e) => handleDragOver(e)} // Allow dropping at the end of the list
            onDragLeave={handleDragLeave} // Clear if leaving list area
            onDrop={handleDropOnList}
          >
            {stages.sort((a, b) => a.order - b.order).map((stage) => (
              <li 
                key={stage.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, stage.id)}
                onDragOver={(e) => {e.stopPropagation(); handleDragOver(e, stage.id);}} // Stop propagation to prevent parent UL handler
                onDragLeave={handleDragLeave}
                onDrop={(e) => {e.stopPropagation(); handleDropOnStage(e, stage.id);}} // Stop propagation
                className={cn(
                    "flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-secondary/30 rounded-md gap-2 relative cursor-grab",
                    "transition-all duration-150 ease-in-out",
                    dropTargetInfo?.id === stage.id && dropTargetInfo.position === 'before' && 'border-t-4 border-primary pt-[calc(0.75rem_+_4px)]', // 0.75rem is p-3
                    dropTargetInfo?.id === stage.id && dropTargetInfo.position === 'after' && 'border-b-4 border-primary pb-[calc(0.75rem_+_4px)]'
                )}
                
              >
                 <div className="absolute left-1 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-muted-foreground/50">
                    <GripVertical className="h-5 w-5" />
                </div>
                {editingStageId === stage.id ? (
                  <form onSubmit={handleSaveStageEdit} className="flex-grow flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:ml-6">
                    <Input
                      type="text"
                      value={editingStageName}
                      onChange={(e) => setEditingStageName(e.target.value)}
                      className="flex-grow"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end sm:justify-start">
                        <Button type="submit" size="sm" className="w-full sm:w-auto">Save</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingStageId(null)} className="w-full sm:w-auto">Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span className="font-medium break-all sm:ml-6">{stage.name}</span>
                    <div className="space-x-2 flex-shrink-0 self-end sm:self-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStage(stage)} aria-label="Edit stage">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteStage(stage.id)}
                        aria-label="Delete stage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
             {dropTargetInfo?.position === 'at-end' && (
                <div className="h-12 border-2 border-dashed border-primary/50 rounded-md flex items-center justify-center text-primary/70 my-2">
                    Drop here to add to end
                </div>
            )}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No stages defined yet. Add a stage to get started.</p>
        )}
      </CardContent>
    </Card>
  );
}
