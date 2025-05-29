
"use client";

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from '@/contexts/projects-context';
import { projectTypes } from '@/lib/project-templates'; // Using projectTypes from templates
import { PlusCircle, PlayCircle, CalendarDays, Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [coordinateSystem, setCoordinateSystem] = useState('');
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([]); // Changed to array for multiple types
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { addProject } = useProjects();
  const router = useRouter();

  const handleProjectTypeChange = (typeId: string) => {
    setSelectedProjectTypes(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Project name is required.");
      return;
    }
    const newProject = addProject({ 
      name, 
      description, 
      budget: budget ? parseFloat(budget) : undefined,
      projectNumber,
      clientContact,
      siteAddress,
      coordinateSystem,
      projectTypes: selectedProjectTypes, // Pass array of selected types
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    // Reset form fields
    setName('');
    setDescription('');
    setBudget('');
    setProjectNumber('');
    setClientContact('');
    setSiteAddress('');
    setCoordinateSystem('');
    setSelectedProjectTypes([]); // Reset selected types
    setStartDate('');
    setDueDate('');
    setIsOpen(false);
    router.push(`/projects/${newProject.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <PlusCircle className="mr-2 h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details for your new project. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh] pr-2">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="projectTypes" className="text-right pt-2 flex items-center">
                   <Workflow className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Types
                </Label>
                <div className="col-span-3 space-y-2">
                  {projectTypes.filter(pt => pt.id !== 'none').map(pt => ( // Exclude 'none' type
                    <div key={pt.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${pt.id}`}
                        checked={selectedProjectTypes.includes(pt.id)}
                        onCheckedChange={() => handleProjectTypeChange(pt.id)}
                      />
                      <Label htmlFor={`type-${pt.id}`} className="font-normal text-sm">
                        {pt.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectNumber" className="text-right">
                  Proj. No.
                </Label>
                <Input
                  id="projectNumber"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., P2024-001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientContact" className="text-right">
                  Client
                </Label>
                <Input
                  id="clientContact"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., John Doe (Acme Corp)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="siteAddress" className="text-right">
                  Site
                </Label>
                <Input
                  id="siteAddress"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., 123 Main St, Anytown"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coordinateSystem" className="text-right">
                  Coord. Sys.
                </Label>
                <Input
                  id="coordinateSystem"
                  value={coordinateSystem}
                  onChange={(e) => setCoordinateSystem(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., WGS84, UTM Zone 10N"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4"> {/* Changed items-center to items-start */}
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget ($)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional (e.g., 5000)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right flex items-center">
                  <PlayCircle className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right flex items-center">
                  <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Save Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
