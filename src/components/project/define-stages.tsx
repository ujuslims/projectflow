"use client";

import type { Stage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit2, ListOrdered } from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface DefineStagesProps {
  stages: Stage[];
  onAddStage: (name: string) => void;
  onUpdateStage: (id: string, name: string) => void;
  onDeleteStage: (id: string) => void;
  // onReorderStages: (stages: Stage[]) => void; // Future: for drag-drop reordering of stages
}

export function DefineStages({ stages, onAddStage, onUpdateStage, onDeleteStage }: DefineStagesProps) {
  const [newStageName, setNewStageName] = useState('');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageName, setEditingStageName] = useState('');

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

  return (
    <Card className="mb-8 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-primary" />
          <CardTitle>Project Stages</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddStage} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Enter new stage name (e.g., To Do, In Progress)"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" variant="secondary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Stage
          </Button>
        </form>
        {stages.length > 0 ? (
          <ul className="space-y-2">
            {stages.sort((a, b) => a.order - b.order).map((stage) => (
              <li key={stage.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                {editingStageId === stage.id ? (
                  <form onSubmit={handleSaveStageEdit} className="flex-grow flex gap-2 items-center">
                    <Input
                      type="text"
                      value={editingStageName}
                      onChange={(e) => setEditingStageName(e.target.value)}
                      className="flex-grow"
                      autoFocus
                    />
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingStageId(null)}>Cancel</Button>
                  </form>
                ) : (
                  <>
                    <span className="font-medium">{stage.name}</span>
                    <div className="space-x-2">
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
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No stages defined yet. Add a stage to get started.</p>
        )}
      </CardContent>
    </Card>
  );
}
