
"use client";

import type { Project, Stage, Subtask, ProjectStatus, SubtaskStatus, SubtaskCore } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { projectStageTemplates } from '@/lib/project-templates'; // Import templates

interface ProjectsContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'stages' | 'subtasks' | 'status' | 'spent' | 'outcomeNotes' | 'createdAt' | 'projectTypes' | 'expectedDeliverables'>
                      & { name: string; description?: string; expectedDeliverables?: string; budget?: number; projectNumber?: string; clientContact?: string; siteAddress?: string; coordinateSystem?: string; projectTypes?: string[]; startDate?: string; dueDate?: string; }) => Project;
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addStage: (projectId: string, stageData: Omit<Stage, 'id' | 'createdAt' | 'order'>) => Stage | undefined;
  updateStage: (projectId: string, stageId: string, updates: Partial<Omit<Stage, 'id' | 'createdAt'>>) => void;
  deleteStage: (projectId: string, stageId: string) => void;
  addSubtask: (projectId: string, stageId: string, subtask: SubtaskCore) => Subtask | undefined;
  addMultipleSubtasks: (projectId: string, stageId: string, subtasksData: SubtaskCore[]) => Subtask[] | undefined;
  updateSubtask: (projectId: string, subtaskId: string, updates: Partial<Omit<Subtask, 'id' | 'createdAt'>>) => void;
  moveSubtask: (projectId: string, subtaskId: string, newStageId: string, newOrder: number) => void;
  deleteSubtask: (projectId: string, subtaskId: string) => void;
  setProjectSubtasks: (projectId: string, subtasks: Subtask[]) => void;
  setProjectStages: (projectId: string, stages: Stage[]) => void;
  markAllSubtasksAsDone: (projectId: string) => void;
  getCalculatedProjectSpent: (projectId: string) => number;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);

  const getCalculatedProjectSpent = (projectId: string): number => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 0;
    return project.subtasks.reduce((sum, subtask) => sum + (subtask.cost || 0), 0);
  };

  const addProject = (projectData: Omit<Project, 'id' | 'stages' | 'subtasks' | 'status' | 'spent' | 'outcomeNotes' | 'createdAt' | 'projectTypes' | 'expectedDeliverables'>
                                & { name: string; description?: string; expectedDeliverables?:string; budget?: number; projectNumber?: string; clientContact?: string; siteAddress?: string; coordinateSystem?: string; projectTypes?: string[]; startDate?: string; dueDate?: string; }) => {

    const initialStageNames = new Set<string>();
    if (projectData.projectTypes && projectData.projectTypes.length > 0) {
      projectData.projectTypes.forEach(typeId => {
        if (projectStageTemplates[typeId]) {
          projectStageTemplates[typeId].forEach(stageName => {
            initialStageNames.add(stageName);
          });
        }
      });
    }
    if (initialStageNames.size === 0) {
        initialStageNames.add('Backlog');
    }


    const initialStages: Stage[] = Array.from(initialStageNames).map((stageName, index) => ({
      id: crypto.randomUUID(),
      name: stageName,
      order: index,
      createdAt: new Date().toISOString(),
    }));

    const newProject: Project = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: projectData.name,
      description: projectData.description || '',
      stages: initialStages,
      subtasks: [],
      budget: projectData.budget || 0,
      spent: 0, // Initial spent is 0, will be calculated
      status: 'Not Started' as ProjectStatus,
      outcomeNotes: '',
      expectedDeliverables: projectData.expectedDeliverables || '',
      startDate: projectData.startDate,
      dueDate: projectData.dueDate,
      projectNumber: projectData.projectNumber || '',
      clientContact: projectData.clientContact || '',
      siteAddress: projectData.siteAddress || '',
      coordinateSystem: projectData.coordinateSystem || '',
      projectTypes: projectData.projectTypes || [],
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
    return newProject;
  };

  const getProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      return { ...project, spent: getCalculatedProjectSpent(id) };
    }
    return undefined;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === id) {
          // Prevent direct update of 'spent' if it's in updates, as it's calculated
          const { spent, ...otherUpdates } = updates;
          return { ...p, ...otherUpdates };
        }
        return p;
      })
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
  };

  const addStage = (projectId: string, stageData: Omit<Stage, 'id' | 'createdAt' | 'order'>) => {
    let newStage: Stage | undefined;
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          newStage = {
            ...stageData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            order: p.stages.length,
          };
          return { ...p, stages: [...p.stages, newStage] };
        }
        return p;
      })
    );
    return newStage;
  };

  const updateStage = (projectId: string, stageId: string, updates: Partial<Omit<Stage, 'id' | 'createdAt'>>) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: p.stages.map(s => (s.id === stageId ? { ...s, ...updates } : s)),
          };
        }
        return p;
      })
    );
  };

  const deleteStage = (projectId: string, stageId: string) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const updatedSubtasks = p.subtasks.filter(st => st.stageId !== stageId);
          return {
            ...p,
            stages: p.stages.filter(s => s.id !== stageId),
            subtasks: updatedSubtasks,
          };
        }
        return p;
      })
    );
  };

  const addSubtask = (projectId: string, stageId: string, subtaskData: SubtaskCore) => {
    let newSubtask: Subtask | undefined;
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const stageExists = p.stages.some(s => s.id === stageId);
          if (!stageExists) return p;

          newSubtask = {
            id: crypto.randomUUID(),
            stageId,
            createdAt: new Date().toISOString(),
            order: p.subtasks.filter(st => st.stageId === stageId).length,
            name: subtaskData.name,
            description: subtaskData.description,
            startDate: subtaskData.startDate,
            endDate: subtaskData.endDate,
            assignedPersonnel: subtaskData.assignedPersonnel,
            location: subtaskData.location,
            status: subtaskData.status || 'To Do' as SubtaskStatus,
            fieldCrewLead: subtaskData.fieldCrewLead || '',
            equipmentUsed: subtaskData.equipmentUsed || '',
            dataDeliverables: subtaskData.dataDeliverables || '',
            cost: subtaskData.cost || 0,
          };
          return { ...p, subtasks: [...p.subtasks, newSubtask] };
        }
        return p;
      })
    );
    return newSubtask;
  };

  const addMultipleSubtasks = (projectId: string, stageId: string, subtasksData: SubtaskCore[]): Subtask[] | undefined => {
    let newSubtasksBatch: Subtask[] = [];
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const stageExists = p.stages.some(s => s.id === stageId);
          if (!stageExists) return p; // Return project unchanged if stage doesn't exist

          let currentOrderInStage = p.subtasks.filter(st => st.stageId === stageId).length;

          const addedSubtasksForThisProject: Subtask[] = subtasksData.map((subtaskCore, index) => ({
            id: crypto.randomUUID(),
            stageId,
            createdAt: new Date().toISOString(),
            order: currentOrderInStage + index,
            name: subtaskCore.name,
            description: subtaskCore.description,
            startDate: subtaskCore.startDate,
            endDate: subtaskCore.endDate,
            assignedPersonnel: subtaskCore.assignedPersonnel,
            location: subtaskCore.location,
            status: subtaskCore.status || 'To Do' as SubtaskStatus,
            fieldCrewLead: subtaskCore.fieldCrewLead || '',
            equipmentUsed: subtaskCore.equipmentUsed || '',
            dataDeliverables: subtaskCore.dataDeliverables || '',
            cost: subtaskCore.cost || 0,
          }));

          newSubtasksBatch = addedSubtasksForThisProject;
          return { ...p, subtasks: [...p.subtasks, ...addedSubtasksForThisProject] };
        }
        return p;
      })
    );
    return newSubtasksBatch.length > 0 ? newSubtasksBatch : undefined;
  };


  const updateSubtask = (projectId: string, subtaskId: string, updates: Partial<Omit<Subtask, 'id' | 'createdAt'>>) => {
     setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            subtasks: p.subtasks.map(st => (st.id === subtaskId ? { ...st, ...updates } : st)),
          };
        }
        return p;
      })
    );
  };

  const moveSubtask = (projectId: string, subtaskId: string, newStageId: string, newOrder: number) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const subtaskToMove = p.subtasks.find(st => st.id === subtaskId);
          if (!subtaskToMove) return p;

          const oldStageId = subtaskToMove.stageId;
          const updatedSubtasks = p.subtasks
            .filter(st => st.id !== subtaskId)
            .map(st => {
              if (st.stageId === oldStageId && st.order > subtaskToMove.order) {
                return { ...st, order: st.order - 1 };
              }
              return st;
            })
            .map(st => {
              if (st.stageId === newStageId && st.order >= newOrder) {
                return { ...st, order: st.order + 1 };
              }
              return st;
            });

          updatedSubtasks.push({ ...subtaskToMove, stageId: newStageId, order: newOrder });
          updatedSubtasks.sort((a,b) => a.stageId.localeCompare(b.stageId) || a.order - b.order);

          return { ...p, subtasks: updatedSubtasks };
        }
        return p;
      })
    );
  };

  const deleteSubtask = (projectId: string, subtaskId: string) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            subtasks: p.subtasks.filter(st => st.id !== subtaskId),
          };
        }
        return p;
      })
    );
  };

  const setProjectSubtasks = (projectId: string, subtasks: Subtask[]) => {
    updateProject(projectId, { subtasks });
  };

  const setProjectStages = (projectId: string, stages: Stage[]) => {
    updateProject(projectId, { stages });
  };

  const markAllSubtasksAsDone = (projectId: string) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const updatedSubtasks = p.subtasks.map(st => ({
            ...st,
            status: 'Done' as SubtaskStatus,
          }));
          return { ...p, subtasks: updatedSubtasks };
        }
        return p;
      })
    );
  };

  // Memoize projects to include calculated spent amount
  const projectsWithCalculatedSpent = useMemo(() => {
    return projects.map(p => ({
      ...p,
      spent: getCalculatedProjectSpent(p.id),
    }));
  }, [projects]);


  return (
    <ProjectsContext.Provider value={{
        projects: projectsWithCalculatedSpent,
        addProject, getProject, updateProject, deleteProject,
        addStage, updateStage, deleteStage,
        addSubtask, addMultipleSubtasks, updateSubtask, moveSubtask, deleteSubtask,
        setProjectSubtasks, setProjectStages,
        markAllSubtasksAsDone,
        getCalculatedProjectSpent
      }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};
