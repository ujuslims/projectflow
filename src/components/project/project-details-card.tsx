
"use client";

import type { Project, ProjectStatus } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // NEW
import { useToast } from '@/hooks/use-toast';
import { Banknote, BarChart3, CalendarCheck2, Edit, FileText, Hourglass, Info, ListTodo, Loader2, PackageOpen, Percent, Save, XCircle, ShieldQuestion, Award, CalendarDays, CheckSquare } from 'lucide-react';
import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { format as formatDate, parseISO } from 'date-fns';
import { useProjects } from '@/contexts/projects-context'; // NEW for markAllSubtasksAsDone


interface ProjectDetailsCardProps {
  project: Project;
  onUpdateProject: (updates: Partial<Pick<Project, 'name' | 'description' | 'budget' | 'spent' | 'status' | 'outcomeNotes' | 'dueDate'>>) => void;
}

const projectStatuses: ProjectStatus[] = ['Not Started', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export function ProjectDetailsCard({ project, onUpdateProject }: ProjectDetailsCardProps) {
  const { toast } = useToast();
  const { markAllSubtasksAsDone } = useProjects(); // NEW
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [dueDate, setDueDate] = useState(project.dueDate ? formatDate(parseISO(project.dueDate), 'yyyy-MM-dd') : ''); // NEW
  const [budget, setBudget] = useState<string>(project.budget?.toString() || '');
  const [spent, setSpent] = useState<string>(project.spent?.toString() || '');
  const [status, setStatus] = useState<ProjectStatus>(project.status || 'Not Started');
  const [outcomeNotes, setOutcomeNotes] = useState(project.outcomeNotes || '');

  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
    setDueDate(project.dueDate ? formatDate(parseISO(project.dueDate), 'yyyy-MM-dd') : ''); // NEW
    setBudget(project.budget?.toString() || '');
    setSpent(project.spent?.toString() || '');
    setStatus(project.status || 'Not Started');
    setOutcomeNotes(project.outcomeNotes || '');
  }, [project]);

  const completedSubtasksCount = useMemo(() => {
    return project.subtasks.filter(st => st.status === 'Done').length;
  }, [project.subtasks]);
  const totalSubtasksCount = project.subtasks.length;
  const taskProgressPercentage = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const budgetProgressPercentage = useMemo(() => {
    if (project.budget && project.budget > 0) {
      return Math.min(Math.round(((project.spent || 0) / project.budget) * 100), 100);
    }
    return 0;
  }, [project.budget, project.spent]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const parsedBudget = budget ? parseFloat(budget) : undefined;
    const parsedSpent = spent ? parseFloat(spent) : undefined;
    const finalDueDate = dueDate ? new Date(dueDate).toISOString() : undefined; // NEW

    if (parsedBudget !== undefined && isNaN(parsedBudget)) {
        toast({ title: "Error", description: "Invalid budget amount.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    if (parsedSpent !== undefined && isNaN(parsedSpent)) {
        toast({ title: "Error", description: "Invalid amount spent.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    onUpdateProject({
      name,
      description,
      dueDate: finalDueDate, // NEW
      budget: parsedBudget,
      spent: parsedSpent,
      status,
      outcomeNotes
    });
    setIsEditing(false);
    setIsLoading(false);
    toast({ title: "Success", description: "Project details updated." });
  };
  
  const projectStatusIcons: Record<ProjectStatus, JSX.Element> = {
    'Not Started': <PackageOpen className="h-4 w-4" />,
    'Planning': <Edit className="h-4 w-4" />,
    'In Progress': <Hourglass className="h-4 w-4" />,
    'On Hold': <Info className="h-4 w-4" />, // Changed from InfoIcon for consistency if Info is preferred
    'Completed': <CalendarCheck2 className="h-4 w-4" />,
    'Cancelled': <XCircle className="h-4 w-4" />,
  };

  const handleMarkAllTasksDone = () => {
    if (window.confirm("Are you sure you want to mark all subtasks as 'Done'? This action cannot be undone easily.")) {
      markAllSubtasksAsDone(project.id);
      toast({ title: "Success", description: "All subtasks marked as Done." });
    }
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
          <CardContent className="p-0"> {/* Remove CardContent padding to use TabList padding */}
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

          <CardContent className="space-y-6 pt-6"> {/* Add padding back for tab content */}
            <TabsContent value="general" className="mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="projectName">Project Name</Label>
                        {isEditing ? (
                        <Input id="projectName" value={name} onChange={(e) => setName(e.target.value)} />
                        ) : (
                        <p className="text-lg font-semibold mt-1">{project.name}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="projectStatus">Status</Label>
                        {isEditing ? (
                        <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
                            <SelectTrigger id="projectStatus">
                            <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                            {projectStatuses.map(s => (
                                <SelectItem key={s} value={s}><div className="flex items-center">{projectStatusIcons[s]}<span className="ml-2">{s}</span></div></SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        ) : (
                        <div className="flex items-center text-lg mt-1">
                            {projectStatusIcons[project.status || 'Not Started']}
                            <span className="ml-2 font-semibold">{project.status || 'Not Started'}</span>
                        </div>
                        )}
                    </div>
                </div>
                <div>
                    <Label htmlFor="projectDueDate">Due Date</Label>
                    {isEditing ? (
                    <Input id="projectDueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                        {project.dueDate ? formatDate(parseISO(project.dueDate), 'PPP') : 'Not set'}
                    </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="projectDescription">Description</Label>
                    {isEditing ? (
                    <Textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    ) : (
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{project.description || "No description provided."}</p>
                    )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectBudget">Total Budget</Label>
                    {isEditing ? (
                      <Input id="projectBudget" type="number" placeholder="e.g., 5000" value={budget} onChange={(e) => setBudget(e.target.value)} />
                    ) : (
                      <p className="text-lg mt-1">{project.budget ? formatCurrency(project.budget) : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="projectSpent">Amount Spent</Label>
                    {isEditing ? (
                      <Input id="projectSpent" type="number" placeholder="e.g., 1500" value={spent} onChange={(e) => setSpent(e.target.value)} />
                    ) : (
                      <p className="text-lg mt-1">{project.spent ? formatCurrency(project.spent) : formatCurrency(0)}</p>
                    )}
                  </div>
                </div>
                {project.budget && project.budget > 0 && (
                  <div>
                    <Label>Budget Usage</Label>
                    <Progress value={budgetProgressPercentage} className="w-full mt-1 h-3" />
                    <p className="text-sm text-muted-foreground mt-1">{budgetProgressPercentage}% of budget used.</p>
                  </div>
                )}
                 {(!project.budget || project.budget === 0) && !isEditing && (
                    <p className="text-sm text-muted-foreground">No budget set for this project.</p>
                 )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <div className="space-y-4">
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
              </div>
            </TabsContent>

            <TabsContent value="outcomes" className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="outcomeNotes">Evaluation / Lessons Learned</Label>
                  {isEditing ? (
                    <Textarea id="outcomeNotes" placeholder="e.g., Key achievements, challenges, future recommendations..." value={outcomeNotes} onChange={(e) => setOutcomeNotes(e.target.value)} rows={4} />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                      {project.outcomeNotes || 'No outcome notes yet.'}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 mt-0 pt-0 pb-6 px-6">
            <Button type="button" variant="outline" onClick={() => { setIsEditing(false); /* Reset form might be needed here if not using useEffect for all fields */ }}>Cancel</Button>
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
