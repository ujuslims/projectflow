"use client";

import type { Project, Stage, Subtask } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectsContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'stages' | 'subtasks'>) => Project;
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addStage: (projectId: string, stage: Omit<Stage, 'id' | 'createdAt' | 'order'>) => Stage | undefined;
  updateStage: (projectId: string, stageId: string, updates: Partial<Omit<Stage, 'id' | 'createdAt'>>) => void;
  deleteStage: (projectId: string, stageId: string) => void;
  addSubtask: (projectId: string, stageId: string, subtask: Omit<Subtask, 'id' | 'createdAt' | 'order' | 'stageId'>) => Subtask | undefined;
  updateSubtask: (projectId: string, subtaskId: string, updates: Partial<Omit<Subtask, 'id' | 'createdAt'>>) => void;
  moveSubtask: (projectId: string, subtaskId: string, newStageId: string, newOrder: number) => void;
  deleteSubtask: (projectId: string, subtaskId: string) => void;
  setProjectSubtasks: (projectId: string, subtasks: Subtask[]) => void;
  setProjectStages: (projectId: string, stages: Stage[]) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'stages' | 'subtasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      stages: [],
      subtasks: [],
    };
    setProjects([...projects, newProject]);
    return newProject;
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === id ? { ...p, ...updates } : p))
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
          // Also delete subtasks associated with this stage
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

  const addSubtask = (projectId: string, stageId: string, subtaskData: Omit<Subtask, 'id' | 'createdAt' | 'order' | 'stageId'>) => {
    let newSubtask: Subtask | undefined;
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const stageExists = p.stages.some(s => s.id === stageId);
          if (!stageExists) return p; // Or handle error
          
          newSubtask = {
            ...subtaskData,
            id: crypto.randomUUID(),
            stageId,
            createdAt: new Date().toISOString(),
            order: p.subtasks.filter(st => st.stageId === stageId).length,
          };
          return { ...p, subtasks: [...p.subtasks, newSubtask] };
        }
        return p;
      })
    );
    return newSubtask;
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
            .filter(st => st.id !== subtaskId) // Remove subtask from its current position
            .map(st => { // Adjust order in old stage
              if (st.stageId === oldStageId && st.order > subtaskToMove.order) {
                return { ...st, order: st.order - 1 };
              }
              return st;
            })
            .map(st => { // Adjust order in new stage
              if (st.stageId === newStageId && st.order >= newOrder) {
                return { ...st, order: st.order + 1 };
              }
              return st;
            });
          
          updatedSubtasks.push({ ...subtaskToMove, stageId: newStageId, order: newOrder });
          updatedSubtasks.sort((a,b) => a.stageId.localeCompare(b.stageId) || a.order - b.order); // ensure consistent ordering for map

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


  return (
    <ProjectsContext.Provider value={{ 
        projects, addProject, getProject, updateProject, deleteProject,
        addStage, updateStage, deleteStage,
        addSubtask, updateSubtask, moveSubtask, deleteSubtask,
        setProjectSubtasks, setProjectStages
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
