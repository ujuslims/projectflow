
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from '@/contexts/projects-context';
import { projectTypes } from '@/lib/project-templates';
import { PlusCircle, PlayCircle, CalendarDays, Workflow, FileArchive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [expectedDeliverables, setExpectedDeliverables] = useState(''); // New state
  const [budget, setBudget] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [coordinateSystem, setCoordinateSystem] = useState('');
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([]);
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
      description: scopeOfWork,
      expectedDeliverables: expectedDeliverables || undefined, // Add to project data
      budget: budget ? parseFloat(budget) : undefined,
      projectNumber,
      clientContact,
      siteAddress,
      coordinateSystem,
      projectTypes: selectedProjectTypes,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    // Reset form fields
    setName('');
    setScopeOfWork('');
    setExpectedDeliverables(''); // Reset new field
    setBudget('');
    setProjectNumber('');
    setClientContact('');
    setSiteAddress('');
    setCoordinateSystem('');
    setSelectedProjectTypes([]);
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="name" className="text-left sm:text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                <Label htmlFor="projectTypes" className="text-left sm:text-right pt-0 sm:pt-2 flex items-center">
                   <Workflow className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Types
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-2">
                  {projectTypes.filter(pt => pt.id !== 'none').map(pt => (
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

               <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="projectNumber" className="text-left sm:text-right">
                  Proj. No.
                </Label>
                <Input
                  id="projectNumber"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., P2024-001"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="clientContact" className="text-left sm:text-right">
                  Client
                </Label>
                <Input
                  id="clientContact"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., John Doe (Acme Corp)"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="siteAddress" className="text-left sm:text-right">
                  Site
                </Label>
                <Input
                  id="siteAddress"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., 123 Main St, Anytown"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="coordinateSystem" className="text-left sm:text-right">
                  Coord. Sys.
                </Label>
                <Input
                  id="coordinateSystem"
                  value={coordinateSystem}
                  onChange={(e) => setCoordinateSystem(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="e.g., WGS84, UTM Zone 10N"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                <Label htmlFor="scopeOfWork" className="text-left sm:text-right pt-0 sm:pt-2">
                  Scope of Work
                </Label>
                <Textarea
                  id="scopeOfWork"
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  rows={3}
                  placeholder="Detailed project scope and objectives..."
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                <Label htmlFor="expectedDeliverables" className="text-left sm:text-right pt-0 sm:pt-2 flex items-start">
                   <FileArchive className="h-3.5 w-3.5 mr-1 mt-0.5 text-muted-foreground" /> Deliverables
                </Label>
                <Textarea
                  id="expectedDeliverables"
                  value={expectedDeliverables}
                  onChange={(e) => setExpectedDeliverables(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  rows={2}
                  placeholder="e.g., Final report, CAD drawings, GIS data..."
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="budget" className="text-left sm:text-right">
                  Budget ($)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="Optional (e.g., 5000)"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="startDate" className="text-left sm:text-right flex items-center">
                  <PlayCircle className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="dueDate" className="text-left sm:text-right flex items-center">
                  <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="col-span-1 sm:col-span-3"
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
