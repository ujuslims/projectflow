
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
          <ul className="space-y-2">
            {stages.sort((a, b) => a.order - b.order).map((stage) => (
              <li key={stage.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-secondary/30 rounded-md gap-2">
                {editingStageId === stage.id ? (
                  <form onSubmit={handleSaveStageEdit} className="flex-grow flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
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
                    <span className="font-medium break-all">{stage.name}</span>
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
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No stages defined yet. Add a stage to get started.</p>
        )}
      </CardContent>
    </Card>
  );
}
