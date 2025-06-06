
"use client";

// AppLayout is now rendered by (protected)/layout.tsx
import { DefineStages } from '@/components/project/define-stages';
import { ProjectDetailsCard } from '@/components/project/project-details-card';
import { StageColumn } from '@/components/project/stage-column';
import { SubtaskDialog } from '@/components/project/subtask-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useProjects } from '@/contexts/projects-context';
import { useToast } from '@/hooks/use-toast';
import type { Project, Stage, Subtask, SubtaskCore, SubtaskStatus } from '@/lib/types';
import { organizeSubtasks, OrganizeSubtasksInput, OrganizeSubtasksOutput, suggestSubtasks, SuggestSubtasksInput, SuggestSubtasksOutput } from '@/ai/flows';
import { AlertCircle, Brain, ListChecks, Loader2, Sparkles, Info, BarChartHorizontalBig, Printer, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  
  const { 
    getProject, addStage, updateStage, deleteStage, reorderStages, clearStageSubtasks,
    addSubtask, updateSubtask, deleteSubtask, moveSubtask,
    setProjectSubtasks, setProjectStages, updateProject,
    addMultipleSubtasks
  } = useProjects();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [targetStageIdForNewSubtask, setTargetStageIdForNewSubtask] = useState<string | null>(null);
  const [draggedSubtaskId, setDraggedSubtaskId] = useState<string | null>(null);
  const [isDraggingOverDeleteArea, setIsDraggingOverDeleteArea] = useState(false);

  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [isAIOrganizing, setIsAIOrganizing] = useState(false);

  // State for delete confirmation dialogs
  const [isStageDeleteAlertOpen, setIsStageDeleteAlertOpen] = useState(false);
  const [stageToDeleteInfo, setStageToDeleteInfo] = useState<{ id: string; name: string } | null>(null);
  const [isSubtaskDeleteAlertOpen, setIsSubtaskDeleteAlertOpen] = useState(false);
  const [subtaskToDeleteInfo, setSubtaskToDeleteInfo] = useState<{ id: string; name: string } | null>(null);
  const [isClearSubtasksAlertOpen, setIsClearSubtasksAlertOpen] = useState(false);
  const [stageToClearSubtasksInfo, setStageToClearSubtasksInfo] = useState<{ id: string; name: string } | null>(null);


  const sortedStages = useMemo(() => {
    const stages = project?.stages;
    if (!stages) return [];
    return [...stages].sort((a, b) => a.order - b.order);
  }, [project?.stages]); 

  useEffect(() => {
    if (projectId) { 
      const currentProject = getProject(projectId);
      if (currentProject) {
        setProject(currentProject);
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        router.push('/projects');
      }
    }
  }, [projectId, getProject, router, toast]); 

  const handleUpdateProjectDetails = (updates: Partial<Project>) => {
    if (!project) return;
    updateProject(project.id, updates);
  };

  const handleAddStage = (name: string) => {
    if (!project) return;
    const newStage = addStage(project.id, { name });
    if (newStage) {
      setProject(prev => prev ? {...prev, stages: [...prev.stages, newStage].sort((a,b)=>a.order-b.order)} : null);
      toast({ title: "Success", description: `Stage "${name}" added.` });
    }
  };

  const handleUpdateStage = (id: string, name: string) => {
    if (!project) return;
    updateStage(project.id, id, { name });
    setProject(prev => prev ? {...prev, stages: prev.stages.map(s => s.id === id ? {...s, name} : s).sort((a,b)=>a.order-b.order) } : null);
    toast({ title: "Success", description: `Stage updated.` });
  };

  const requestDeleteStage = (id: string) => {
    if (!project) return;
    const stageToDelete = project.stages.find(s => s.id === id);
    if (stageToDelete) {
      setStageToDeleteInfo({ id: stageToDelete.id, name: stageToDelete.name });
      setIsStageDeleteAlertOpen(true);
    }
  };

  const confirmDeleteStage = () => {
    if (!project || !stageToDeleteInfo) return;
    deleteStage(project.id, stageToDeleteInfo.id);
    // Re-fetch or update project state to reflect new stage order and removal
    const updatedProject = getProject(project.id);
    if (updatedProject) setProject(updatedProject);
    toast({ title: "Success", description: `Stage "${stageToDeleteInfo.name}" deleted.` });
    setIsStageDeleteAlertOpen(false);
    setStageToDeleteInfo(null);
  };
  
  const handleReorderStages = (projId: string, sourceStageId: string, targetStageId: string | null) => {
    if (!project) return;
    reorderStages(projId, sourceStageId, targetStageId);
    // Re-fetch or update project state to reflect new stage order
    const updatedProject = getProject(project.id);
    if (updatedProject) setProject(updatedProject);
    toast({ title: "Success", description: "Stages reordered."});
  };


  const openNewSubtaskDialog = (stageId: string) => {
    setEditingSubtask(null);
    setTargetStageIdForNewSubtask(stageId);
    setIsSubtaskDialogOpen(true);
  };

  const openEditSubtaskDialog = (subtask: Subtask) => {
    setEditingSubtask(subtask);
    setTargetStageIdForNewSubtask(null);
    setIsSubtaskDialogOpen(true);
  };

  const handleSubtaskFormSubmit = (subtaskData: SubtaskCore) => {
    if (!project) return;
    if (editingSubtask) {
      const updatedSubtaskData = { ...editingSubtask, ...subtaskData };
      updateSubtask(project.id, editingSubtask.id, updatedSubtaskData);
      setProject(prev => prev ? {...prev, subtasks: prev.subtasks.map(st => st.id === editingSubtask.id ? updatedSubtaskData : st)} : null);
      toast({ title: "Success", description: `Subtask "${subtaskData.name}" updated.` });
    } else if (targetStageIdForNewSubtask) {
      const newSubtask = addSubtask(project.id, targetStageIdForNewSubtask, subtaskData);
      if (newSubtask) {
         setProject(prev => prev ? {...prev, subtasks: [...prev.subtasks, newSubtask]} : null);
        toast({ title: "Success", description: `Subtask "${subtaskData.name}" added.` });
      }
    }
    setIsSubtaskDialogOpen(false);
    setEditingSubtask(null);
    setTargetStageIdForNewSubtask(null);
  };

  const requestDeleteSubtask = (subtaskId: string) => {
    if (!project) return;
    const subtaskToDelete = project.subtasks.find(st => st.id === subtaskId);
    if (subtaskToDelete) {
      setSubtaskToDeleteInfo({ id: subtaskToDelete.id, name: subtaskToDelete.name });
      setIsSubtaskDeleteAlertOpen(true);
    }
  };

  const confirmDeleteSubtask = () => {
    if (!project || !subtaskToDeleteInfo) return;
    deleteSubtask(project.id, subtaskToDeleteInfo.id);
    setProject(prev => prev ? {...prev, subtasks: prev.subtasks.filter(st => st.id !== subtaskToDeleteInfo.id)} : null);
    toast({ title: "Success", description: `Subtask "${subtaskToDeleteInfo.name}" deleted.` });
    setIsSubtaskDeleteAlertOpen(false);
    setSubtaskToDeleteInfo(null);
  };
  
  const onSubtaskDragStart = (e: React.DragEvent<HTMLDivElement>, subtaskId: string) => {
    e.dataTransfer.setData("subtaskId", subtaskId);
    setDraggedSubtaskId(subtaskId);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, stageId?: string) => { 
    e.preventDefault(); 
    if (stageId) { 
      setIsDraggingOverDeleteArea(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetStageId: string) => {
    e.preventDefault();
    setIsDraggingOverDeleteArea(false); 
    if (!project || !draggedSubtaskId) return;

    const subtaskId = e.dataTransfer.getData("subtaskId");
    const subtaskToMove = project.subtasks.find(st => st.id === subtaskId);
    if (!subtaskToMove) return;

    const targetSubtasksInStage = project.subtasks.filter(st => st.stageId === targetStageId && st.id !== subtaskId);
    const newOrder = targetSubtasksInStage.length; 

    moveSubtask(project.id, subtaskId, targetStageId, newOrder);
    
    setProject(prev => {
        if (!prev) return null;
        let movedSubtask = prev.subtasks.find(st => st.id === subtaskId)!;
        let otherSubtasks = prev.subtasks.filter(st => st.id !== subtaskId);

        otherSubtasks = otherSubtasks.map(st => {
            if (st.stageId === movedSubtask.stageId && st.order > movedSubtask.order) {
                return { ...st, order: st.order - 1 };
            }
            return st;
        });
        
        otherSubtasks = otherSubtasks.map(st => {
            if (st.stageId === targetStageId && st.order >= newOrder) {
                return { ...st, order: st.order + 1 };
            }
            return st;
        });
        
        movedSubtask = { ...movedSubtask, stageId: targetStageId, order: newOrder };
        const finalSubtasks = [...otherSubtasks, movedSubtask].sort((a, b) => {
            if (a.stageId === b.stageId) return a.order - b.order;
            const stageAOrder = prev.stages.find(s => s.id === a.stageId)?.order ?? 0;
            const stageBOrder = prev.stages.find(s => s.id === b.stageId)?.order ?? 0;
            return stageAOrder - stageBOrder || a.order - b.order;
        });

        return { ...prev, subtasks: finalSubtasks };
    });
    setDraggedSubtaskId(null);
  };

  const handleAISuggestSubtasks = async (targetStageInfo?: { id: string, name: string }) => {
    if (!project || !project.description) {
      toast({ title: "Info", description: "Project scope of work is needed for AI suggestions.", variant: "default" });
      return;
    }
    if (project.stages.length === 0) {
      toast({ title: "Info", description: "Please add at least one stage before suggesting subtasks.", variant: "default" });
      return;
    }

    setIsAISuggesting(true);
    try {
      const stageToTargetId = targetStageInfo ? targetStageInfo.id : sortedStages[0]?.id;
      const stageToTargetAIName = targetStageInfo ? targetStageInfo.name : undefined; // For AI prompt
      const stageToDisplayInToast = targetStageInfo ? targetStageInfo.name : sortedStages[0]?.name;


      if (!stageToTargetId) {
         toast({ title: "Error", description: "No stages available to add subtasks.", variant: "destructive" });
         setIsAISuggesting(false);
         return;
      }

      const input: SuggestSubtasksInput = { 
        projectDescription: project.description,
        targetStageName: stageToTargetAIName
      };
      const result: SuggestSubtasksOutput = await suggestSubtasks(input);
      
      const subtasksToCreate: SubtaskCore[] = result.subtasks.map(subtaskName => ({ name: subtaskName, status: 'To Do' as SubtaskStatus }));
      const addedBatch = addMultipleSubtasks(project.id, stageToTargetId, subtasksToCreate);
      
      if (addedBatch && addedBatch.length > 0) {
        setProject(prev => prev ? {...prev, subtasks: [...prev.subtasks, ...addedBatch]} : null);
        toast({ title: "AI Suggestions Added", description: `${addedBatch.length} subtasks suggested and added to "${stageToDisplayInToast}".` });
      } else if (result.subtasks.length > 0) {
        toast({ title: "AI Error", description: "AI suggested tasks, but they could not be added to the project.", variant: "destructive" });
      } else {
        toast({ title: "AI Suggestions", description: `No new subtasks were suggested by the AI for stage "${stageToDisplayInToast}".`, variant: "default" });
      }

    } catch (error) {
      console.error("AI Suggestion Error:", error);
      toast({ title: "AI Error", description: "Could not get subtask suggestions.", variant: "destructive" });
    } finally {
      setIsAISuggesting(false);
    }
  };

  const handleAIOrganizeSubtasks = async () => {
    if (!project || project.subtasks.length === 0 || project.stages.length === 0) {
      toast({ title: "Info", description: "Project, stages, and subtasks are needed for AI organization.", variant: "default" });
      return;
    }
    setIsAIOrganizing(true);
    try {
      const input: OrganizeSubtasksInput = {
        projectName: project.name,
        stages: sortedStages.map(s => s.name), 
        subtasks: project.subtasks.map(st => ({ name: st.name, description: st.description })),
      };
      const result: OrganizeSubtasksOutput = await organizeSubtasks(input);
      
      let currentSubtasksMap = new Map(project.subtasks.map(st => [st.id, {...st}]));
      const finalSubtasks: Subtask[] = [];
      
      if (result.organizedStages) {
        result.organizedStages.forEach(organizedStage => {
          const stageName = organizedStage.stageName;
          const aiStageSubtasks = organizedStage.subtasks;
          const targetStage = sortedStages.find(s => s.name === stageName); 

          if (targetStage) {
            aiStageSubtasks.forEach((aiSubtask, order) => {
              const matchedSubtaskEntry = Array.from(currentSubtasksMap.entries())
                  .find(([id, st]) => st.name === aiSubtask.name);

              if (matchedSubtaskEntry) {
                const [matchedId, matchedSubtask] = matchedSubtaskEntry;
                finalSubtasks.push({
                  ...matchedSubtask,
                  stageId: targetStage.id,
                  order, 
                  description: aiSubtask.description || matchedSubtask.description,
                  endDate: aiSubtask.endDate || matchedSubtask.endDate, 
                });
                currentSubtasksMap.delete(matchedId); 
              }
            });
          }
        });
      }

      Array.from(currentSubtasksMap.values()).forEach(unmatchedSubtask => {
          const originalStageSubtasksCount = finalSubtasks.filter(st => st.stageId === unmatchedSubtask.stageId).length;
          finalSubtasks.push({
              ...unmatchedSubtask,
              order: originalStageSubtasksCount 
          });
      });
      
      setProjectSubtasks(project.id, finalSubtasks);
      setProject(prev => prev ? {...prev, subtasks: finalSubtasks.sort((a,b) => (sortedStages.find(s=>s.id === a.stageId)?.order ?? 0) - (sortedStages.find(s=>s.id === b.stageId)?.order ?? 0) || a.order - b.order)} : null);

      toast({ title: "AI Organization Applied", description: "Subtasks have been organized." });
    } catch (error) {
      console.error("AI Organization Error:", error);
      toast({ title: "AI Error", description: "Could not organize subtasks.", variant: "destructive" });
    } finally {
      setIsAIOrganizing(false);
    }
  };

  const requestClearStageSubtasks = (stageId: string, stageName: string) => {
    setStageToClearSubtasksInfo({ id: stageId, name: stageName });
    setIsClearSubtasksAlertOpen(true);
  };

  const confirmClearStageSubtasks = () => {
    if (!project || !stageToClearSubtasksInfo) return;
    clearStageSubtasks(project.id, stageToClearSubtasksInfo.id);
    setProject(prev => prev ? {...prev, subtasks: prev.subtasks.filter(st => st.stageId !== stageToClearSubtasksInfo.id)} : null);
    toast({ title: "Success", description: `All subtasks in stage "${stageToClearSubtasksInfo.name}" cleared.` });
    setIsClearSubtasksAlertOpen(false);
    setStageToClearSubtasksInfo(null);
  };
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading project...</p>
      </div>
    );
  }
  
  const aiSuggestButtonDisabled = isAISuggesting || !project.description || project.stages.length === 0;

  return (
    <>
      <ProjectDetailsCard project={project} onUpdateProject={handleUpdateProjectDetails} />
      <Separator className="my-8" />
      <DefineStages
        projectId={project.id}
        stages={sortedStages} 
        onAddStage={handleAddStage}
        onUpdateStage={handleUpdateStage}
        onDeleteStage={requestDeleteStage}
        onReorderStages={handleReorderStages}
      />
      <div className="my-8 flex flex-col sm:flex-row gap-4 justify-start items-start sm:items-center flex-wrap">
        
        {sortedStages.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={aiSuggestButtonDisabled}>
                {isAISuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                AI Suggest Subtasks
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleAISuggestSubtasks()}>
                For Backlog / First Stage
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>For Specific Stage:</DropdownMenuLabel>
              {sortedStages.map(stage => (
                <DropdownMenuItem key={stage.id} onClick={() => handleAISuggestSubtasks({ id: stage.id, name: stage.name })}>
                  {stage.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => handleAISuggestSubtasks()} disabled={aiSuggestButtonDisabled}>
            {isAISuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            AI Suggest Subtasks
          </Button>
        )}

        <Button onClick={handleAIOrganizeSubtasks} disabled={isAIOrganizing || project.subtasks.length === 0 || project.stages.length === 0} variant="outline">
          {isAIOrganizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
          AI Organize Subtasks
        </Button>
        <Button asChild variant="outline">
          <Link href={`/projects/${project.id}/timeline`}>
            <BarChartHorizontalBig className="mr-2 h-4 w-4" />
            View Timeline
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/projects/${project.id}/summary`}>
            <Printer className="mr-2 h-4 w-4" />
            Project Report
          </Link>
        </Button>
      </div>
      {(!project.description || project.stages.length === 0) && (
          <Alert variant="default" className="mb-4 bg-accent/10 border-accent/30">
            <Info className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">AI Feature Tip</AlertTitle>
            <AlertDescription>
              {!project.description && "Add a project scope of work to enable AI Subtask Suggestions. "}
              {project.stages.length === 0 && "Add at least one stage to enable AI features."}
            </AlertDescription>
          </Alert>
        )}
      <Separator className="my-8" />
      {sortedStages.length === 0 ? ( 
        <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No Stages Defined</h2>
            <p className="text-muted-foreground mb-4">Add stages above to start organizing your subtasks.</p>
        </div>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap pb-4 relative">
            <ScrollBar
              orientation="horizontal"
              className="absolute top-0 left-0 right-0 z-10 h-2.5"
            />
            <div className="flex gap-6 pt-4"> {/* Added pt-4 for top scrollbar space */}
            {sortedStages.map(stage => ( 
                <StageColumn
                key={stage.id}
                stage={stage}
                subtasks={project.subtasks.filter(st => st.stageId === stage.id)}
                onDragOver={(e) => onDragOver(e, stage.id)}
                onDrop={(e) => onDrop(e, stage.id)}
                onSubtaskDragStart={onSubtaskDragStart}
                onAddSubtask={() => openNewSubtaskDialog(stage.id)}
                onEditSubtask={openEditSubtaskDialog}
                onDeleteSubtask={requestDeleteSubtask}
                onRequestClearSubtasks={requestClearStageSubtasks}
                />
            ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      <SubtaskDialog
        isOpen={isSubtaskDialogOpen}
        onOpenChange={setIsSubtaskDialogOpen}
        onSubmit={handleSubtaskFormSubmit}
        initialData={editingSubtask || undefined}
        dialogTitle={editingSubtask ? "Edit Subtask" : "Add New Subtask"}
        submitButtonText={editingSubtask ? "Save Changes" : "Add Subtask"}
      />

      {draggedSubtaskId && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOverDeleteArea(true);
          }}
          onDragEnter={() => setIsDraggingOverDeleteArea(true)}
          onDragLeave={() => setIsDraggingOverDeleteArea(false)}
          onDrop={(e) => {
            e.preventDefault();
            const subtaskId = e.dataTransfer.getData("subtaskId");
            if (subtaskId) {
              requestDeleteSubtask(subtaskId); 
            }
            setIsDraggingOverDeleteArea(false);
            setDraggedSubtaskId(null); 
          }}
          className={cn(
            "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center",
            isDraggingOverDeleteArea 
              ? "bg-destructive scale-110 ring-4 ring-destructive/30" 
              : "bg-destructive/70 hover:bg-destructive"
          )}
          title="Drag subtask here to delete"
        >
          <Trash2 className="h-7 w-7 text-destructive-foreground" />
        </div>
      )}

      {/* Stage Delete Confirmation Dialog */}
      <AlertDialog open={isStageDeleteAlertOpen} onOpenChange={setIsStageDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
               <Trash2 className="h-5 w-5 mr-2 text-destructive" />
              Confirm Stage Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the stage "{stageToDeleteInfo?.name}"? 
              This action cannot be undone and will permanently remove all associated subtasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsStageDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStage}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Stage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subtask Delete Confirmation Dialog */}
      <AlertDialog open={isSubtaskDeleteAlertOpen} onOpenChange={setIsSubtaskDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <AlertDialogTitle className="flex items-center">
               <Trash2 className="h-5 w-5 mr-2 text-destructive" />
              Confirm Subtask Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the subtask "{subtaskToDeleteInfo?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsSubtaskDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSubtask}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Subtask
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Stage Subtasks Confirmation Dialog */}
      <AlertDialog open={isClearSubtasksAlertOpen} onOpenChange={setIsClearSubtasksAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-destructive" />
              Confirm Clear All Subtasks
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ALL subtasks in the stage "{stageToClearSubtasksInfo?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsClearSubtasksAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearStageSubtasks}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Clear All Subtasks
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


    