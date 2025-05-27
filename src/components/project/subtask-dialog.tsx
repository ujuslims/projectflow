"use client";

import type { Subtask, SubtaskCore } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, type FormEvent } from 'react';

interface SubtaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (subtaskData: SubtaskCore) => void;
  initialData?: SubtaskCore;
  dialogTitle?: string;
  dialogDescription?: string;
  submitButtonText?: string;
}

export function SubtaskDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  dialogTitle = "Subtask Details",
  dialogDescription = "Fill in the details for the subtask.",
  submitButtonText = "Save Subtask"
}: SubtaskDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedDeadline, setSuggestedDeadline] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setSuggestedDeadline(initialData.suggestedDeadline ? new Date(initialData.suggestedDeadline).toISOString().split('T')[0] : '');
    } else {
      setName('');
      setDescription('');
      setSuggestedDeadline('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Subtask name is required.");
      return;
    }
    onSubmit({ 
      name, 
      description, 
      suggestedDeadline: suggestedDeadline ? new Date(suggestedDeadline).toISOString() : undefined 
    });
    onOpenChange(false); // Close dialog on submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtask-name" className="text-right">
                Name
              </Label>
              <Input
                id="subtask-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtask-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="subtask-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtask-deadline" className="text-right">
                Deadline
              </Label>
              <Input
                id="subtask-deadline"
                type="date"
                value={suggestedDeadline}
                onChange={(e) => setSuggestedDeadline(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
