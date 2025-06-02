
"use client";

import type { SubtaskCore, SubtaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, type FormEvent } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign } from 'lucide-react';

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
  const [fieldCrewLead, setFieldCrewLead] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');
  const [dataDeliverables, setDataDeliverables] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    if (isOpen) { 
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setStartDate(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
      setEndDate(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
      setAssignedPersonnel(initialData?.assignedPersonnel?.toString() || '');
      setLocation(initialData?.location || '');
      setStatus(initialData?.status || 'To Do');
      setFieldCrewLead(initialData?.fieldCrewLead || '');
      setEquipmentUsed(initialData?.equipmentUsed || '');
      setDataDeliverables(initialData?.dataDeliverables || '');
      setCost(initialData?.cost?.toString() || '');
    } else {
      // Optionally reset form fields when dialog is closed and not just on initial open
      // This can be useful if the dialog is re-used without changing initialData
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setAssignedPersonnel('');
      setLocation('');
      setStatus('To Do');
      setFieldCrewLead('');
      setEquipmentUsed('');
      setDataDeliverables('');
      setCost('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Subtask name is required.");
      return;
    }
    const parsedCost = cost ? parseFloat(cost) : undefined;
    if (cost && isNaN(parsedCost as number)) {
        alert("Invalid cost amount.");
        return;
    }

    onSubmit({ 
      name, 
      description: description || undefined, 
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      assignedPersonnel: assignedPersonnel ? parseInt(assignedPersonnel, 10) : undefined,
      location: location || undefined,
      status,
      fieldCrewLead: fieldCrewLead || undefined,
      equipmentUsed: equipmentUsed || undefined,
      dataDeliverables: dataDeliverables || undefined,
      cost: parsedCost,
    });
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden min-h-0">
          <ScrollArea className="flex-grow min-h-0">
            <div className="grid gap-4 p-6">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-name" className="text-left sm:text-right">
                  Name
                </Label>
                <Input
                  id="subtask-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                <Label htmlFor="subtask-description" className="text-left sm:text-right pt-0 sm:pt-2">
                  Description
                </Label>
                <Textarea
                  id="subtask-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-status" className="text-left sm:text-right">
                  Status
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as SubtaskStatus)}>
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtaskStatuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-cost" className="text-left sm:text-right flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Cost
                </Label>
                <Input
                  id="subtask-cost"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., 250.50"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-start-date" className="text-left sm:text-right">
                  Start Date
                </Label>
                <Input
                  id="subtask-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-end-date" className="text-left sm:text-right">
                  End Date
                </Label>
                <Input
                  id="subtask-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-crew-lead" className="text-left sm:text-right">
                  Crew Lead
                </Label>
                <Input
                  id="subtask-crew-lead"
                  value={fieldCrewLead}
                  onChange={(e) => setFieldCrewLead(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., Mike R."
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-personnel" className="text-left sm:text-right">
                  Personnel #
                </Label>
                <Input
                  id="subtask-personnel"
                  type="number"
                  value={assignedPersonnel}
                  onChange={(e) => setAssignedPersonnel(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., 3"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subtask-location" className="text-left sm:text-right">
                  Location
                </Label>
                <Input
                  id="subtask-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., Site A, Zone 1"
                />
              </div>
               <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                <Label htmlFor="subtask-equipment" className="text-left sm:text-right pt-0 sm:pt-2">
                  Equipment
                </Label>
                <Textarea
                  id="subtask-equipment"
                  value={equipmentUsed}
                  onChange={(e) => setEquipmentUsed(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  rows={2}
                  placeholder="e.g., GPS, Total Station, Drone (comma-separated)"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                <Label htmlFor="subtask-deliverables" className="text-left sm:text-right pt-0 sm:pt-2">
                  Deliverables
                </Label>
                <Textarea
                  id="subtask-deliverables"
                  value={dataDeliverables}
                  onChange={(e) => setDataDeliverables(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  rows={2}
                  placeholder="e.g., Raw data, Processed map, Report (comma-separated)"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
