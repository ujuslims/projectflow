
"use client";

import type { Project, ProjectStatus, ProjectType as AppProjectType } from '@/lib/types'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox"; 
import { useToast } from '@/hooks/use-toast';
import { Banknote, BarChart3, CalendarCheck2, Edit, FileText, Hourglass, Info, ListTodo, Loader2, PackageOpen, Percent, Save, XCircle, Award, CalendarDays, CheckSquare, User, Building, Hash, Globe, PlayCircle, Workflow, DollarSign } from 'lucide-react'; 
import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { format as formatDate, parseISO, isValid } from 'date-fns';
import { useProjects } from '@/contexts/projects-context';
import { projectTypes as availableProjectTypes } from '@/lib/project-templates'; 
import { useCurrency } from '@/contexts/currency-context';

interface ProjectDetailsCardProps {
  project: Project;
  onUpdateProject: (updates: Partial<Pick<Project, 'name' | 'description' | 'budget' | /* 'spent' removed */ 'status' | 'outcomeNotes' | 'startDate' | 'dueDate' | 'projectNumber' | 'clientContact' | 'siteAddress' | 'coordinateSystem' | 'projectTypes'>>) => void;
}

const projectStatuses: ProjectStatus[] = ['Not Started', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export function ProjectDetailsCard({ project, onUpdateProject }: ProjectDetailsCardProps) {
  const { toast } = useToast();
  const { markAllSubtasksAsDone, getCalculatedProjectSpent } = useProjects();
  const { selectedCurrency } = useCurrency(); 
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [name, setName] = useState(project.name);
  const [scopeOfWork, setScopeOfWork] = useState(project.description);
  const [startDate, setStartDate] = useState(project.startDate && isValid(parseISO(project.startDate)) ? formatDate(parseISO(project.startDate), 'yyyy-MM-dd') : '');
  const [dueDate, setDueDate] = useState(project.dueDate && isValid(parseISO(project.dueDate)) ? formatDate(parseISO(project.dueDate), 'yyyy-MM-dd') : '');
  const [budget, setBudget] = useState<string>(project.budget?.toString() || '');
  // const [spent, setSpent] = useState<string>(project.spent?.toString() || ''); // Removed, will be calculated
  const [status, setStatus] = useState<ProjectStatus>(project.status || 'Not Started');
  const [outcomeNotes, setOutcomeNotes] = useState(project.outcomeNotes || '');
  const [projectNumber, setProjectNumber] = useState(project.projectNumber || '');
  const [clientContact, setClientContact] = useState(project.clientContact || '');
  const [siteAddress, setSiteAddress] = useState(project.siteAddress || '');
  const [coordinateSystem, setCoordinateSystem] = useState(project.coordinateSystem || '');
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(project.projectTypes || []);

  const calculatedSpent = useMemo(() => {
    return getCalculatedProjectSpent(project.id);
  }, [project.id, project.subtasks, getCalculatedProjectSpent]);


  useEffect(() => {
    setName(project.name);
    setScopeOfWork(project.description);
    setStartDate(project.startDate && isValid(parseISO(project.startDate)) ? formatDate(parseISO(project.startDate), 'yyyy-MM-dd') : '');
    setDueDate(project.dueDate && isValid(parseISO(project.dueDate)) ? formatDate(parseISO(project.dueDate), 'yyyy-MM-dd') : '');
    setBudget(project.budget?.toString() || '');
    // setSpent(project.spent?.toString() || ''); // No longer directly setting spent
    setStatus(project.status || 'Not Started');
    setOutcomeNotes(project.outcomeNotes || '');
    setProjectNumber(project.projectNumber || '');
    setClientContact(project.clientContact || '');
    setSiteAddress(project.siteAddress || '');
    setCoordinateSystem(project.coordinateSystem || '');
    setSelectedProjectTypes(project.projectTypes || []);
  }, [project]);

  const completedSubtasksCount = useMemo(() => {
    return project.subtasks.filter(st => st.status === 'Done').length;
  }, [project.subtasks]);
  const totalSubtasksCount = project.subtasks.length;
  const taskProgressPercentage = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const budgetProgressPercentage = useMemo(() => {
    const currentBudget = parseFloat(budget); 
    if (currentBudget && currentBudget > 0) {
      return Math.min(Math.round(((calculatedSpent || 0) / currentBudget) * 100), 100);
    }
    return 0;
  }, [budget, calculatedSpent]);


  const handleProjectTypeChange = (typeId: string) => {
    setSelectedProjectTypes(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const parsedBudget = budget ? parseFloat(budget) : undefined;
    // const parsedSpent = spent ? parseFloat(spent) : undefined; // Not needed
    const finalStartDate = startDate ? new Date(startDate).toISOString() : undefined;
    const finalDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;

    if (parsedBudget !== undefined && isNaN(parsedBudget)) {
        toast({ title: "Error", description: "Invalid budget amount.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    // No longer validating direct spent input

    onUpdateProject({
      name,
      description: scopeOfWork,
      startDate: finalStartDate,
      dueDate: finalDueDate,
      budget: parsedBudget,
      // spent: parsedSpent, // Removed from updates
      status,
      outcomeNotes,
      projectNumber,
      clientContact,
      siteAddress,
      coordinateSystem,
      projectTypes: selectedProjectTypes,
    });
    setIsEditing(false);
    setIsLoading(false);
    toast({ title: "Success", description: "Project details updated." });
  };
  
  const projectStatusIcons: Record<ProjectStatus, JSX.Element> = {
    'Not Started': <PackageOpen className="h-4 w-4" />,
    'Planning': <Edit className="h-4 w-4" />,
    'In Progress': <Hourglass className="h-4 w-4" />,
    'On Hold': <Info className="h-4 w-4" />,
    'Completed': <CalendarCheck2 className="h-4 w-4" />,
    'Cancelled': <XCircle className="h-4 w-4" />,
  };

  const handleMarkAllTasksDone = () => {
    if (window.confirm("Are you sure you want to mark all subtasks as 'Done'? This action cannot be undone easily.")) {
      markAllSubtasksAsDone(project.id);
      toast({ title: "Success", description: "All subtasks marked as Done." });
    }
  };

  const renderField = (label: string, value: string | number | undefined | null | string[], Icon?: React.ElementType, isEditingMode?: boolean, editComponent?: React.ReactNode, placeholder?: string ) => {
    let displayValue: string | React.ReactNode = value || (isEditingMode ? '' : 'Not set');
    if (label === "Amount Spent" || (label === "Total Budget" && typeof value === 'number')) { // Special handling for currency display
        displayValue = formatCurrency(value as number, selectedCurrency);
    } else if (typeof value === 'number') { 
        displayValue = value.toString();
    } else if (Array.isArray(value)) { 
      if (value.length === 0) {
        displayValue = 'Not set';
      } else {
        displayValue = value.map(typeId => availableProjectTypes.find(pt => pt.id === typeId)?.name || typeId).join(', ');
      }
    }


    return (
      <div>
        <Label className="flex items-center">
            {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground" />}
            {label}
        </Label>
        {isEditingMode ? (
          editComponent
        ) : (
          <p className={cn("text-sm mt-1 whitespace-pre-wrap", (!value || (Array.isArray(value) && value.length === 0) && typeof value !== 'number') && "text-muted-foreground")}>{displayValue}</p>
        )}
      </div>
    );
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center">
            <ListTodo className="mr-2 h-6 w-6 text-primary" />
            Project Details
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Details
            </Button>
          )}
        </div>
        <CardDescription>Manage and track your project's key information and progress across different aspects.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardContent className="p-0">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-0 rounded-none border-b">
              <TabsTrigger value="general" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Info className="mr-2 h-4 w-4"/>General
              </TabsTrigger>
              <TabsTrigger value="budget" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Banknote className="mr-2 h-4 w-4"/>Budget
              </TabsTrigger>
              <TabsTrigger value="progress" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <BarChart3 className="mr-2 h-4 w-4"/>Progress
              </TabsTrigger>
              <TabsTrigger value="outcomes" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Award className="mr-2 h-4 w-4"/>Outcomes
              </TabsTrigger>
            </TabsList>
          </CardContent>

          <CardContent className="space-y-6 pt-6">
            <TabsContent value="general" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("Project Name", project.name, FileText, isEditing, 
                    <Input id="projectName" value={name} onChange={(e) => setName(e.target.value)} />
                )}
                {renderField("Status", project.status, Hourglass, isEditing,
                  <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
                    <SelectTrigger id="projectStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map(s => (
                        <SelectItem key={s} value={s}><div className="flex items-center">{projectStatusIcons[s]}<span className="ml-2">{s}</span></div></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("Project Number", project.projectNumber, Hash, isEditing,
                    <Input id="projectNumber" value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)} placeholder="e.g., P2024-001" />
                )}
                {renderField("Client Contact", project.clientContact, User, isEditing,
                    <Input id="clientContact" value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="e.g., Jane Doe (XYZ Corp)" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {renderField("Start Date", project.startDate ? (isValid(parseISO(project.startDate)) ? formatDate(parseISO(project.startDate), 'PPP') : 'Invalid Date') : 'Not set', PlayCircle, isEditing,
                    <Input id="projectStartDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                )}
                 {renderField("Due Date", project.dueDate ? (isValid(parseISO(project.dueDate)) ? formatDate(parseISO(project.dueDate), 'PPP') : 'Invalid Date') : 'Not set', CalendarDays, isEditing,
                    <Input id="projectDueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("Site Address", project.siteAddress, Building, isEditing,
                    <Input id="siteAddress" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} placeholder="e.g., 456 Field Ave" />
                )}
                {renderField("Coordinate System", project.coordinateSystem, Globe, isEditing,
                  <Input id="coordinateSystem" value={coordinateSystem} onChange={(e) => setCoordinateSystem(e.target.value)} placeholder="e.g., WGS84 / UTM Zone 12N" />
                )}
              </div>
             
              {renderField("Scope of Work", project.description, undefined, isEditing,
                <Textarea id="projectScopeOfWork" value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} rows={3} placeholder="Detailed project scope and objectives..." />,
                 "No scope of work provided."
              )}

              {renderField("Project Types", project.projectTypes, Workflow, isEditing,
                <div className="col-span-1 sm:col-span-full space-y-2 max-h-32 overflow-y-auto border p-2 rounded-md bg-input/50">
                    {availableProjectTypes.filter(pt => pt.id !== 'none').map(pt => (
                    <div key={pt.id} className="flex items-center space-x-2">
                        <Checkbox
                        id={`edit-type-${pt.id}`}
                        checked={selectedProjectTypes.includes(pt.id)}
                        onCheckedChange={() => handleProjectTypeChange(pt.id)}
                        />
                        <Label htmlFor={`edit-type-${pt.id}`} className="font-normal text-sm">
                        {pt.name}
                        </Label>
                    </div>
                    ))}
                </div>
              )}

            </TabsContent>

            <TabsContent value="budget" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("Total Budget", project.budget, DollarSign, isEditing, 
                    <Input id="projectBudget" type="number" placeholder="e.g., 5000" value={budget} onChange={(e) => setBudget(e.target.value)} step="0.01"/>
                )}
                {renderField("Amount Spent", calculatedSpent, DollarSign, false)}
              </div>
              {(isEditing ? parseFloat(budget) : project.budget) && (isEditing ? parseFloat(budget) : project.budget)! > 0 && (
                <div>
                  <Label>Budget Usage</Label>
                  <Progress value={budgetProgressPercentage} className="w-full mt-1 h-3" />
                  <p className="text-sm text-muted-foreground mt-1">{budgetProgressPercentage}% of budget used.</p>
                </div>
              )}
              {(!(isEditing ? parseFloat(budget) : project.budget) || (isEditing ? parseFloat(budget) : project.budget) === 0) && (
                  <p className="text-sm text-muted-foreground">No budget set for this project.</p>
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-0 space-y-4">
              <div>
                <Label>Overall Task Progress</Label>
                <Progress value={taskProgressPercentage} className="w-full mt-1 h-3" />
                <p className="text-sm text-muted-foreground mt-1">
                  {completedSubtasksCount} of {totalSubtasksCount} tasks completed ({taskProgressPercentage}%).
                </p>
              </div>
              {project.status === 'Completed' && !isEditing && (
                <div className="pt-4">
                  <Button type="button" variant="outline" onClick={handleMarkAllTasksDone}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Finalize: Mark all tasks as Done
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This action will set the status of all subtasks for this project to 'Done'.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="outcomes" className="mt-0 space-y-4">
               {renderField("Evaluation / Lessons Learned", project.outcomeNotes, Award, isEditing,
                <Textarea id="outcomeNotes" placeholder="e.g., Key achievements, challenges, future recommendations..." value={outcomeNotes} onChange={(e) => setOutcomeNotes(e.target.value)} rows={4} />,
                 "No outcome notes yet."
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 mt-0 pt-0 pb-6 px-6">
            <Button type="button" variant="outline" onClick={() => { 
                setIsEditing(false); 
                setName(project.name);
                setScopeOfWork(project.description);
                setStartDate(project.startDate && isValid(parseISO(project.startDate)) ? formatDate(parseISO(project.startDate), 'yyyy-MM-dd') : '');
                setDueDate(project.dueDate && isValid(parseISO(project.dueDate)) ? formatDate(parseISO(project.dueDate), 'yyyy-MM-dd') : '');
                setBudget(project.budget?.toString() || '');
                // setSpent(project.spent?.toString() || ''); // No need to reset spent, it's calculated
                setStatus(project.status || 'Not Started');
                setOutcomeNotes(project.outcomeNotes || '');
                setProjectNumber(project.projectNumber || '');
                setClientContact(project.clientContact || '');
                setSiteAddress(project.siteAddress || '');
                setCoordinateSystem(project.coordinateSystem || '');
                setSelectedProjectTypes(project.projectTypes || []);
            }}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
