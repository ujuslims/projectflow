
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { DefineStages } from '@/components/project/define-stages';
import { ProjectDetailsCard } from '@/components/project/project-details-card'; // New Import
import { StageColumn } from '@/components/project/stage-column';
import { SubtaskDialog } from '@/components/project/subtask-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useProjects } from '@/contexts/projects-context';
import { useToast } from '@/hooks/use-toast';
import type { Project, Stage, Subtask, SubtaskCore } from '@/lib/types';
import { organizeSubtasks, OrganizeSubtasksInput, OrganizeSubtasksOutput, suggestSubtasks, SuggestSubtasksInput, SuggestSubtasksOutput } from '@/ai/flows';
import { AlertCircle, Brain, ListChecks, Loader2, Sparkles, Info } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  
  const { 
    getProject, addStage, updateStage, deleteStage, 
    addSubtask, updateSubtask, deleteSubtask, moveSubtask,
    setProjectSubtasks, setProjectStages, updateProject // Added updateProject
  } = useProjects();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [targetStageIdForNewSubtask, setTargetStageIdForNewSubtask] = useState<string | null>(null);
  const [draggedSubtaskId, setDraggedSubtaskId] = useState<string | null>(null);

  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [isAIOrganizing, setIsAIOrganizing] = useState(false);

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
    // Project state will re-render due to context update
  };

  const handleAddStage = (name: string) => {
    if (!project) return;
    const newStage = addStage(project.id, { name });
    if (newStage) {
      // The project state will be updated via the context, causing a re-render.
      // No need to call setProject here if context updates trigger re-render of this component.
      // To be safe and ensure immediate UI update if context propagation is delayed:
      setProject(prev => prev ? {...prev, stages: [...prev.stages, newStage].sort((a,b)=>a.order-b.order)} : null);
      toast({ title: "Success", description: `Stage "${name}" added.` });
    }
  };

  const handleUpdateStage = (id: string, name: string) => {
    if (!project) return;
    updateStage(project.id, id, { name });
    // As above, context should handle re-render. For safety:
    setProject(prev => prev ? {...prev, stages: prev.stages.map(s => s.id === id ? {...s, name} : s).sort((a,b)=>a.order-b.order) } : null);
    toast({ title: "Success", description: `Stage updated.` });
  };

  const handleDeleteStage = (id: string) => {
    if (!project) return;
    const stageToDelete = project.stages.find(s => s.id === id);
    if (window.confirm(`Are you sure you want to delete stage "${stageToDelete?.name}" and all its subtasks?`)) {
      deleteStage(project.id, id);
      // Context handles re-render. For safety:
      setProject(prev => {
        if (!prev) return null;
        const updatedStages = prev.stages.filter(s => s.id !== id);
        return {
          ...prev,
          stages: updatedStages.sort((a,b)=>a.order-b.order),
          subtasks: prev.subtasks.filter(st => st.stageId !== id),
        };
      });
      toast({ title: "Success", description: `Stage "${stageToDelete?.name}" deleted.` });
    }
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

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!project) return;
    const subtaskToDelete = project.subtasks.find(st => st.id === subtaskId);
    if (window.confirm(`Are you sure you want to delete subtask "${subtaskToDelete?.name}"?`)) {
      deleteSubtask(project.id, subtaskId);
      setProject(prev => prev ? {...prev, subtasks: prev.subtasks.filter(st => st.id !== subtaskId)} : null);
      toast({ title: "Success", description: `Subtask "${subtaskToDelete?.name}" deleted.` });
    }
  };
  
  const onSubtaskDragStart = (e: React.DragEvent<HTMLDivElement>, subtaskId: string) => {
    e.dataTransfer.setData("subtaskId", subtaskId);
    setDraggedSubtaskId(subtaskId);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault(); 
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetStageId: string) => {
    e.preventDefault();
    if (!project || !draggedSubtaskId) return;

    const subtaskId = e.dataTransfer.getData("subtaskId");
    const subtaskToMove = project.subtasks.find(st => st.id === subtaskId);
    if (!subtaskToMove) return;

    const targetSubtasksInStage = project.subtasks.filter(st => st.stageId === targetStageId && st.id !== subtaskId);
    const newOrder = targetSubtasksInStage.length; 

    moveSubtask(project.id, subtaskId, targetStageId, newOrder);
    
    // For immediate UI update:
    setProject(prev => {
        if (!prev) return null;
        let movedSubtask = prev.subtasks.find(st => st.id === subtaskId)!;
        let otherSubtasks = prev.subtasks.filter(st => st.id !== subtaskId);

        // Adjust order in old stage
        otherSubtasks = otherSubtasks.map(st => {
            if (st.stageId === movedSubtask.stageId && st.order > movedSubtask.order) {
                return { ...st, order: st.order - 1 };
            }
            return st;
        });
        
        // Adjust order in new stage
        otherSubtasks = otherSubtasks.map(st => {
            if (st.stageId === targetStageId && st.order >= newOrder) {
                return { ...st, order: st.order + 1 };
            }
            return st;
        });
        
        movedSubtask = { ...movedSubtask, stageId: targetStageId, order: newOrder };
        const finalSubtasks = [...otherSubtasks, movedSubtask].sort((a, b) => {
            if (a.stageId === b.stageId) return a.order - b.order;
            return prev.stages.find(s => s.id === a.stageId)!.order - prev.stages.find(s => s.id === b.stageId)!.order;
        });

        return { ...prev, subtasks: finalSubtasks };
    });
    setDraggedSubtaskId(null);
  };

  const handleAISuggestSubtasks = async () => {
    if (!project || !project.description) {
      toast({ title: "Info", description: "Project description is needed for AI suggestions.", variant: "default" });
      return;
    }
    if (project.stages.length === 0) {
      toast({ title: "Info", description: "Please add at least one stage (e.g., 'Backlog') before suggesting subtasks.", variant: "default" });
      return;
    }

    setIsAISuggesting(true);
    try {
      const input: SuggestSubtasksInput = { projectDescription: project.description };
      const result: SuggestSubtasksOutput = await suggestSubtasks(input);
      
      const backlogStage = project.stages.sort((a,b) => a.order - b.order)[0]; 
      const newSubtasks: Subtask[] = [];
      result.subtasks.forEach(subtaskName => {
        const addedSubtask = addSubtask(project.id, backlogStage.id, { name: subtaskName });
        if (addedSubtask) newSubtasks.push(addedSubtask);
      });
      if (newSubtasks.length > 0) {
        setProject(prev => prev ? {...prev, subtasks: [...prev.subtasks, ...newSubtasks]} : null);
      }
      toast({ title: "AI Suggestions Added", description: `${result.subtasks.length} subtasks suggested and added to "${backlogStage.name}".` });
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
        stages: project.stages.map(s => s.name),
        subtasks: project.subtasks.map(st => ({ name: st.name, description: st.description })),
      };
      const result: OrganizeSubtasksOutput = await organizeSubtasks(input);
      
      let currentSubtasksMap = new Map(project.subtasks.map(st => [st.id, {...st}]));
      const finalSubtasks: Subtask[] = [];
      
      Object.entries(result.categorizedSubtasks).forEach(([stageName, aiStageSubtasks]) => {
        const targetStageId = project.stages.find(s => s.name === stageName)?.id;
        if (targetStageId) {
          aiStageSubtasks.forEach((aiSubtask, order) => {
            // Find subtask by name, imperfect but the AI only knows names
            const matchedSubtaskEntry = Array.from(currentSubtasksMap.entries()).find(([id, st]) => st.name === aiSubtask.name);
            if (matchedSubtaskEntry) {
              const [matchedId, matchedSubtask] = matchedSubtaskEntry;
              finalSubtasks.push({
                ...matchedSubtask,
                stageId: targetStageId,
                order,
                description: aiSubtask.description || matchedSubtask.description,
                suggestedDeadline: aiSubtask.suggestedDeadline || matchedSubtask.suggestedDeadline,
              });
              currentSubtasksMap.delete(matchedId); // Remove from map so it's not added again
            }
          });
        }
      });

      // Add back any subtasks not matched/categorized by AI, keep their original stage and order (relative to other uncat. tasks)
      // This might be complex to re-order perfectly. For now, add to first stage or keep original.
      // For simplicity, we are using the AI's organization as authoritative for the subtasks it mentions.
      // Subtasks not mentioned by the AI will remain in the `currentSubtasksMap`. We'll add them back.
      // This simple approach appends them to their original stage, re-calculating order.
      Array.from(currentSubtasksMap.values()).forEach(unmatchedSubtask => {
        const originalStageSubtasksCount = finalSubtasks.filter(st => st.stageId === unmatchedSubtask.stageId).length;
        finalSubtasks.push({
            ...unmatchedSubtask,
            order: originalStageSubtasksCount // Append to the end of its original stage among newly organized ones
        });
      });
      
      setProjectSubtasks(project.id, finalSubtasks);
      setProject(prev => prev ? {...prev, subtasks: finalSubtasks.sort((a,b) => (project.stages.find(s=>s.id === a.stageId)?.order ?? 0) - (project.stages.find(s=>s.id === b.stageId)?.order ?? 0) || a.order - b.order)} : null);

      toast({ title: "AI Organization Applied", description: "Subtasks have been organized." });
    } catch (error) {
      console.error("AI Organization Error:", error);
      toast({ title: "AI Error", description: "Could not organize subtasks.", variant: "destructive" });
    } finally {
      setIsAIOrganizing(false);
    }
  };

  if (!project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading project...</p>
        </div>
      </AppLayout>
    );
  }
  
  const sortedStages = useMemo(() => [...project.stages].sort((a, b) => a.order - b.order), [project.stages]);

  return (
    <AppLayout>
      <div className="mb-6">
        {/* Project Name and Description are now part of ProjectDetailsCard */}
      </div>
      
      <ProjectDetailsCard project={project} onUpdateProject={handleUpdateProjectDetails} />
      
      <Separator className="my-8" />

      <DefineStages
        stages={sortedStages}
        onAddStage={handleAddStage}
        onUpdateStage={handleUpdateStage}
        onDeleteStage={handleDeleteStage}
      />

      <div className="my-8 flex flex-col sm:flex-row gap-4 justify-start items-start sm:items-center">
        <Button onClick={handleAISuggestSubtasks} disabled={isAISuggesting || !project.description || project.stages.length === 0}>
          {isAISuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          AI Suggest Subtasks
        </Button>
        <Button onClick={handleAIOrganizeSubtasks} disabled={isAIOrganizing || project.subtasks.length === 0 || project.stages.length === 0} variant="outline">
          {isAIOrganizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
          AI Organize Subtasks
        </Button>
      </div>
      {(!project.description || project.stages.length === 0) && (
          <Alert variant="default" className="mb-4 bg-accent/10 border-accent/30">
            <Info className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">AI Feature Tip</AlertTitle>
            <AlertDescription>
              {!project.description && "Add a project description to enable AI Subtask Suggestions. "}
              {project.stages.length === 0 && "Add at least one stage to enable AI features."}
            </AlertDescription>
          </Alert>
        )}


      <Separator className="my-8" />
      
      {project.stages.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No Stages Defined</h2>
            <p className="text-muted-foreground mb-4">Add stages above to start organizing your subtasks.</p>
        </div>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex gap-6">
            {sortedStages.map(stage => (
                <StageColumn
                key={stage.id}
                stage={stage}
                subtasks={project.subtasks.filter(st => st.stageId === stage.id)}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onSubtaskDragStart={onSubtaskDragStart}
                onAddSubtask={() => openNewSubtaskDialog(stage.id)}
                onEditSubtask={openEditSubtaskDialog}
                onDeleteSubtask={handleDeleteSubtask}
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
    </AppLayout>
  );
}
