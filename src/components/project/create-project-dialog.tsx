
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from '@/contexts/projects-context';
import { projectTypes } from '@/lib/project-templates';
import { PlusCircle, CalendarClock, PlayCircle } from 'lucide-react'; // Added PlayCircle
import { useRouter } from 'next/navigation';

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [coordinateSystem, setCoordinateSystem] = useState('');
  const [projectType, setProjectType] = useState<string>('none');
  const [createdAtDate, setCreatedAtDate] = useState(''); 
  const [startDate, setStartDate] = useState(''); // New state for start date
  const { addProject } = useProjects();
  const router = useRouter();

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
      projectType: projectType === 'none' ? undefined : projectType,
      createdAt: createdAtDate ? new Date(createdAtDate).toISOString() : undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined, // Pass startDate
    });
    // Reset form fields
    setName('');
    setDescription('');
    setBudget('');
    setProjectNumber('');
    setClientContact('');
    setSiteAddress('');
    setCoordinateSystem('');
    setProjectType('none');
    setCreatedAtDate('');
    setStartDate(''); // Reset start date
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
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Increased max-h slightly */}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectType" className="text-right">
                Type
              </Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(pt => (
                    <SelectItem key={pt.id} value={pt.id}>
                      {pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
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
              <Label htmlFor="createdAtDate" className="text-right flex items-center">
                 <CalendarClock className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Created
              </Label>
              <Input
                id="createdAtDate"
                type="date"
                value={createdAtDate}
                onChange={(e) => setCreatedAtDate(e.target.value)}
                className="col-span-3"
                placeholder="Defaults to today"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Save Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
