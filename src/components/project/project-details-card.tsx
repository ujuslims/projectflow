
"use client";

import type { Project, ProjectStatus, ProjectOutcomes, EquipmentItem, PersonnelItem } from '@/lib/types';
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
import { Banknote, BarChart3, CalendarCheck2, Edit, FileText, Hourglass, Info, ListTodo, Loader2, PackageOpen, Percent, Save, XCircle, Award, CalendarDays, CheckSquare, User, Building, Hash, Globe, PlayCircle, Workflow, DollarSign, FileArchive, ListPlus, Lightbulb, Target, Star, AlertTriangle, BookOpen, TrendingUp, Wrench, Users2, Trash2, PlusCircle } from 'lucide-react';
import { useState, useEffect, useMemo, type FormEvent, useCallback } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { format as formatDate, parseISO, isValid } from 'date-fns';
import { useProjects } from '@/contexts/projects-context';
import { projectTypes as availableProjectTypes } from '@/lib/project-templates';
import { useCurrency } from '@/contexts/currency-context';

interface ProjectDetailsCardProps {
  project: Project;
  onUpdateProject: (updates: Partial<Pick<Project, 'name' | 'description' | 'budget' | 'status' | 'outcomes' | 'expectedDeliverables' | 'startDate' | 'dueDate' | 'projectNumber' | 'clientContact' | 'siteAddress' | 'coordinateSystem' | 'projectTypes' | 'customProjectTypes' | 'equipmentList' | 'personnelList'>>) => void;
}

const projectStatuses: ProjectStatus[] = ['Not Started', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export function ProjectDetailsCard({ project, onUpdateProject }: ProjectDetailsCardProps) {
  const { toast } = useToast();
  const { markAllSubtasksAsDone, getCalculatedProjectSpent } = useProjects();
  const { selectedCurrency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // General Fields
  const [name, setName] = useState(project.name);
  const [scopeOfWork, setScopeOfWork] = useState(project.description);
  const [expectedDeliverables, setExpectedDeliverables] = useState(project.expectedDeliverables || '');
  const [startDate, setStartDate] = useState(project.startDate && isValid(parseISO(project.startDate)) ? formatDate(parseISO(project.startDate), 'yyyy-MM-dd') : '');
  const [dueDate, setDueDate] = useState(project.dueDate && isValid(parseISO(project.dueDate)) ? formatDate(parseISO(project.dueDate), 'yyyy-MM-dd') : '');
  const [budget, setBudget] = useState<string>(project.budget?.toString() || '');
  const [status, setStatus] = useState<ProjectStatus>(project.status || 'Not Started');
  const [projectNumber, setProjectNumber] = useState(project.projectNumber || '');
  const [clientContact, setClientContact] = useState(project.clientContact || '');
  const [siteAddress, setSiteAddress] = useState(project.siteAddress || '');
  const [coordinateSystem, setCoordinateSystem] = useState(project.coordinateSystem || '');
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(project.projectTypes || []);
  const [customProjectTypesInput, setCustomProjectTypesInput] = useState(project.customProjectTypes?.join(', ') || '');

  // Outcomes Fields
  const [keyFindings, setKeyFindings] = useState(project.outcomes?.keyFindings || '');
  const [conclusions, setConclusions] = useState(project.outcomes?.conclusions || '');
  const [recommendations, setRecommendations] = useState(project.outcomes?.recommendations || '');
  const [achievements, setAchievements] = useState(project.outcomes?.achievements || '');
  const [challenges, setChallenges] = useState(project.outcomes?.challenges || '');
  const [lessonsLearned, setLessonsLearned] = useState(project.outcomes?.lessonsLearned || '');

  // Resources Fields
  const [currentEquipmentList, setCurrentEquipmentList] = useState<EquipmentItem[]>(project.equipmentList || []);
  const [newEquipmentItemName, setNewEquipmentItemName] = useState('');
  const [newEquipmentItemModel, setNewEquipmentItemModel] = useState('');
  const [currentPersonnelList, setCurrentPersonnelList] = useState<PersonnelItem[]>(project.personnelList || []);
  const [newPersonnelItemName, setNewPersonnelItemName] = useState('');
  const [newPersonnelItemRole, setNewPersonnelItemRole] = useState('');


  const calculatedSpent = useMemo(() => {
    return getCalculatedProjectSpent(project.id);
  }, [project.id, project.subtasks, getCalculatedProjectSpent]);


  const resetFormFields = useCallback(() => {
    setName(project.name);
    setScopeOfWork(project.description);
    setExpectedDeliverables(project.expectedDeliverables || '');
    setStartDate(project.startDate && isValid(parseISO(project.startDate)) ? formatDate(parseISO(project.startDate), 'yyyy-MM-dd') : '');
    setDueDate(project.dueDate && isValid(parseISO(project.dueDate)) ? formatDate(parseISO(project.dueDate), 'yyyy-MM-dd') : '');
    setBudget(project.budget?.toString() || '');
    setStatus(project.status || 'Not Started');
    setProjectNumber(project.projectNumber || '');
    setClientContact(project.clientContact || '');
    setSiteAddress(project.siteAddress || '');
    setCoordinateSystem(project.coordinateSystem || '');
    setSelectedProjectTypes(project.projectTypes || []);
    setCustomProjectTypesInput(project.customProjectTypes?.join(', ') || '');

    setKeyFindings(project.outcomes?.keyFindings || '');
    setConclusions(project.outcomes?.conclusions || '');
    setRecommendations(project.outcomes?.recommendations || '');
    setAchievements(project.outcomes?.achievements || '');
    setChallenges(project.outcomes?.challenges || '');
    setLessonsLearned(project.outcomes?.lessonsLearned || '');

    setCurrentEquipmentList(project.equipmentList || []);
    setNewEquipmentItemName('');
    setNewEquipmentItemModel('');
    setCurrentPersonnelList(project.personnelList || []);
    setNewPersonnelItemName('');
    setNewPersonnelItemRole('');
  }, [project]);

  useEffect(() => {
    resetFormFields();
  }, [project, resetFormFields]);

  const completedSubtasksCount = useMemo(() => {
    return project.subtasks.filter(st => st.status === 'Done').length;
  }, [project.subtasks]);
  const totalSubtasksCount = project.subtasks.length;
  const taskProgressPercentage = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const budgetProgressPercentage = useMemo(() => {
    const currentBudget = parseFloat(budget);
    if (currentBudget && currentBudget > 0) {
      return Math.round(((calculatedSpent || 0) / currentBudget) * 100);
    }
    return 0;
  }, [budget, calculatedSpent]);


  const handleProjectTypeChange = (typeId: string) => {
    setSelectedProjectTypes(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };

  const handleAddEquipmentItem = () => {
    if (newEquipmentItemName.trim() && newEquipmentItemModel.trim()) {
      setCurrentEquipmentList(prev => [...prev, { name: newEquipmentItemName.trim(), model: newEquipmentItemModel.trim() }]);
      setNewEquipmentItemName('');
      setNewEquipmentItemModel('');
    } else {
      toast({ title: "Info", description: "Equipment name and model are required.", variant: "default" });
    }
  };

  const handleDeleteEquipmentItem = (itemIndex: number) => {
    setCurrentEquipmentList(prev => prev.filter((_, index) => index !== itemIndex));
  };

  const handleAddPersonnelItem = () => {
    if (newPersonnelItemName.trim() && newPersonnelItemRole.trim()) {
      setCurrentPersonnelList(prev => [...prev, { name: newPersonnelItemName.trim(), role: newPersonnelItemRole.trim() }]);
      setNewPersonnelItemName('');
      setNewPersonnelItemRole('');
    } else {
      toast({ title: "Info", description: "Personnel name and role are required.", variant: "default" });
    }
  };

  const handleDeletePersonnelItem = (itemIndex: number) => {
    setCurrentPersonnelList(prev => prev.filter((_, index) => index !== itemIndex));
  };


  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const parsedBudget = budget ? parseFloat(budget) : undefined;
    const finalStartDate = startDate ? new Date(startDate).toISOString() : undefined;
    const finalDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;
    const customTypesArray = customProjectTypesInput.split(',').map(s => s.trim()).filter(s => s !== '');

    if (parsedBudget !== undefined && isNaN(parsedBudget)) {
        toast({ title: "Error", description: "Invalid budget amount.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    const projectOutcomes: ProjectOutcomes = {
        keyFindings: keyFindings || undefined,
        conclusions: conclusions || undefined,
        recommendations: recommendations || undefined,
        achievements: achievements || undefined,
        challenges: challenges || undefined,
        lessonsLearned: lessonsLearned || undefined,
    };

    onUpdateProject({
      name,
      description: scopeOfWork,
      expectedDeliverables: expectedDeliverables || undefined,
      startDate: finalStartDate,
      dueDate: finalDueDate,
      budget: parsedBudget,
      status,
      outcomes: projectOutcomes,
      projectNumber,
      clientContact,
      siteAddress,
      coordinateSystem,
      projectTypes: selectedProjectTypes,
      customProjectTypes: customTypesArray.length > 0 ? customTypesArray : undefined,
      equipmentList: currentEquipmentList.length > 0 ? currentEquipmentList : undefined,
      personnelList: currentPersonnelList.length > 0 ? currentPersonnelList : undefined,
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
  
  const renderOutcomeField = (label: string, value: string | undefined, Icon: React.ElementType, isEditingMode: boolean, textareaValue: string, setTextareaValue: (val: string) => void, placeholder: string) => {
    return (
      <div>
        <Label htmlFor={`outcome-${label.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center text-base font-semibold mb-1">
          <Icon className="mr-2 h-5 w-5 text-primary" />
          {label}
        </Label>
        {isEditingMode ? (
          <Textarea 
            id={`outcome-${label.toLowerCase().replace(/\s+/g, '-')}`} 
            value={textareaValue} 
            onChange={(e) => setTextareaValue(e.target.value)} 
            rows={3} 
            placeholder={placeholder}
            className="text-sm"
          />
        ) : (
          <p className={cn("text-sm mt-1 whitespace-pre-wrap bg-muted/30 p-3 rounded-md min-h-[40px]", !value && "text-muted-foreground italic")}>
            {value || "Not set"}
          </p>
        )}
      </div>
    );
  };


  const renderField = (label: string, value: string | number | undefined | null | string[], Icon?: React.ElementType, isEditingMode?: boolean, editComponent?: React.ReactNode, placeholderText?: string ) => {
    let displayValue: string | React.ReactNode = value || (isEditingMode ? '' : (placeholderText || 'Not set'));
    if (label === "Amount Spent" || (label === "Total Budget" && typeof value === 'number')) {
        displayValue = formatCurrency(value as number, selectedCurrency);
    } else if (label === "Custom Project Types") {
        displayValue = Array.isArray(value) && value.length > 0 ? value.join(', ') : (placeholderText || 'Not set');
    } else if (typeof value === 'number') {
        displayValue = value.toString();
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        displayValue = (placeholderText || 'Not set');
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

  const getBudgetUsageText = () => {
    if (budgetProgressPercentage > 100) {
      const overSpendPercent = budgetProgressPercentage - 100;
      return `${budgetProgressPercentage}% used (${overSpendPercent}% over budget)`;
    }
    return `${budgetProgressPercentage}% of budget used.`;
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-0 rounded-none border-b">
              <TabsTrigger value="general" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Info className="mr-2 h-4 w-4"/>General
              </TabsTrigger>
              <TabsTrigger value="resources" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Wrench className="mr-2 h-4 w-4"/>Resources
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

              {renderField("Expected Deliverables", project.expectedDeliverables, FileArchive, isEditing,
                <Textarea id="projectExpectedDeliverables" value={expectedDeliverables} onChange={(e) => setExpectedDeliverables(e.target.value)} rows={2} placeholder="e.g., Final report, CAD files..." />,
                "No expected deliverables set."
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
               {renderField("Custom Project Types", project.customProjectTypes, ListPlus, isEditing,
                <Textarea id="customProjectTypes" value={customProjectTypesInput} onChange={(e) => setCustomProjectTypesInput(e.target.value)} rows={2} placeholder="e.g., Specialized Survey, Feasibility Study (comma-separated)" />,
                "Not set"
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-0 space-y-6">
              {isEditing ? (
                <>
                  {/* Equipment List Management */}
                  <div>
                    <Label htmlFor="equipment-item-name" className="text-base font-semibold mb-1 flex items-center">
                      <Wrench className="mr-2 h-5 w-5 text-primary" /> Equipment List
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
                      <div className="sm:col-span-1">
                        <Label htmlFor="equipment-item-name" className="text-xs">Name</Label>
                        <Input
                          id="equipment-item-name"
                          value={newEquipmentItemName}
                          onChange={(e) => setNewEquipmentItemName(e.target.value)}
                          placeholder="Equipment Name"
                          className="text-sm h-9"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Label htmlFor="equipment-item-model" className="text-xs">Model/Type</Label>
                        <Input
                          id="equipment-item-model"
                          value={newEquipmentItemModel}
                          onChange={(e) => setNewEquipmentItemModel(e.target.value)}
                          placeholder="Model or Type"
                          className="text-sm h-9"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEquipmentItem();}}}
                        />
                      </div>
                      <Button type="button" onClick={handleAddEquipmentItem} variant="secondary" size="sm" className="h-9 sm:self-end">
                        <PlusCircle className="mr-2 h-4 w-4"/>Add
                      </Button>
                    </div>
                    {currentEquipmentList.length > 0 ? (
                      <ul className="space-y-1 text-sm list-disc pl-5 bg-muted/30 p-3 rounded-md max-h-48 overflow-y-auto">
                        {currentEquipmentList.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name} ({item.model})</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEquipmentItem(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">No equipment added yet.</p>
                    )}
                  </div>

                  {/* Personnel List Management */}
                  <div>
                    <Label htmlFor="personnel-item-name" className="text-base font-semibold mb-1 flex items-center">
                      <Users2 className="mr-2 h-5 w-5 text-primary" /> Personnel List
                    </Label>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
                       <div className="sm:col-span-1">
                        <Label htmlFor="personnel-item-name" className="text-xs">Name</Label>
                        <Input
                          id="personnel-item-name"
                          value={newPersonnelItemName}
                          onChange={(e) => setNewPersonnelItemName(e.target.value)}
                          placeholder="Personnel Name"
                          className="text-sm h-9"
                        />
                       </div>
                       <div className="sm:col-span-1">
                          <Label htmlFor="personnel-item-role" className="text-xs">Role</Label>
                          <Input
                            id="personnel-item-role"
                            value={newPersonnelItemRole}
                            onChange={(e) => setNewPersonnelItemRole(e.target.value)}
                            placeholder="Role/Title"
                            className="text-sm h-9"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPersonnelItem();}}}
                          />
                       </div>
                      <Button type="button" onClick={handleAddPersonnelItem} variant="secondary" size="sm" className="h-9 sm:self-end">
                         <PlusCircle className="mr-2 h-4 w-4"/>Add
                      </Button>
                    </div>
                     {currentPersonnelList.length > 0 ? (
                      <ul className="space-y-1 text-sm list-disc pl-5 bg-muted/30 p-3 rounded-md max-h-48 overflow-y-auto">
                        {currentPersonnelList.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name} - {item.role}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeletePersonnelItem(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">No personnel added yet.</p>
                    )}
                  </div>
                </>
              ) : (
                 <>
                  <div>
                    <h3 className="text-base font-semibold mb-1 flex items-center">
                       <Wrench className="mr-2 h-5 w-5 text-primary" /> Equipment List
                    </h3>
                    {(project.equipmentList && project.equipmentList.length > 0) ? (
                        <ul className="text-sm list-disc pl-7 space-y-0.5 bg-muted/30 p-3 rounded-md">
                            {project.equipmentList.map((item, index) => <li key={index}>{item.name} ({item.model})</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">No equipment listed for this project.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1 flex items-center">
                       <Users2 className="mr-2 h-5 w-5 text-primary" /> Personnel List
                    </h3>
                    {(project.personnelList && project.personnelList.length > 0) ? (
                        <ul className="text-sm list-disc pl-7 space-y-0.5 bg-muted/30 p-3 rounded-md">
                            {project.personnelList.map((item, index) => <li key={index}>{item.name} - {item.role}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">No personnel listed for this project.</p>
                    )}
                  </div>
                </>
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
                  <Progress
                    value={Math.min(budgetProgressPercentage, 100)}
                    className={cn(
                      "w-full mt-1 h-3",
                      budgetProgressPercentage > 100 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                    )}
                  />
                  <p className={cn(
                      "text-sm text-muted-foreground mt-1",
                      budgetProgressPercentage > 100 && "text-destructive font-medium"
                    )}
                  >
                    {getBudgetUsageText()}
                  </p>
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

            <TabsContent value="outcomes" className="mt-0 space-y-6">
              {renderOutcomeField("Key Findings", project.outcomes?.keyFindings, Lightbulb, isEditing, keyFindings, setKeyFindings, "What were the primary discoveries or results?")}
              {renderOutcomeField("Conclusions", project.outcomes?.conclusions, Target, isEditing, conclusions, setConclusions, "What interpretations or judgments were made based on the findings?")}
              {renderOutcomeField("Recommendations", project.outcomes?.recommendations, TrendingUp, isEditing, recommendations, setRecommendations, "What future actions or suggestions arise from this project?")}
              {renderOutcomeField("Achievements", project.outcomes?.achievements, Star, isEditing, achievements, setAchievements, "What were the notable successes or positive outcomes?")}
              {renderOutcomeField("Challenges", project.outcomes?.challenges, AlertTriangle, isEditing, challenges, setChallenges, "What obstacles or difficulties were encountered?")}
              {renderOutcomeField("Lessons Learned", project.outcomes?.lessonsLearned, BookOpen, isEditing, lessonsLearned, setLessonsLearned, "What new knowledge or insights were gained?")}
            </TabsContent>
          </CardContent>
        </Tabs>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 mt-0 pt-0 pb-6 px-6">
            <Button type="button" variant="outline" onClick={() => {
                setIsEditing(false);
                resetFormFields();
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
