
"use client";

import type { SubtaskCore, SubtaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const subtaskStatuses: SubtaskStatus[] = ['To Do', 'In Progress', 'Done', 'Blocked'];

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedPersonnel, setAssignedPersonnel] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<SubtaskStatus>('To Do');

  useEffect(() => {
    if (isOpen) { 
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setStartDate(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
      setEndDate(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
      setAssignedPersonnel(initialData?.assignedPersonnel?.toString() || '');
      setLocation(initialData?.location || '');
      setStatus(initialData?.status || 'To Do');
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
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      assignedPersonnel: assignedPersonnel ? parseInt(assignedPersonnel, 10) : undefined,
      location: location || undefined,
      status
    });
    onOpenChange(false); 
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
              <Label htmlFor="subtask-start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="subtask-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtask-end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="subtask-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtask-personnel" className="text-right">
                Personnel
              </Label>
              <Input
                id="subtask-personnel"
                type="number"
                value={assignedPersonnel}
                onChange={(e) => setAssignedPersonnel(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtask-location" className="text-right">
                Location
              </Label>
              <Input
                id="subtask-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Site A, Floor 2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtask-status" className="text-right">
                Status
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as SubtaskStatus)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {subtaskStatuses.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
