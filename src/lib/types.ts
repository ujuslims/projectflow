
export type ProjectStatus = 'Not Started' | 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type SubtaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Blocked';

export interface SubtaskCore {
  name: string;
  description?: string;
  startDate?: string; // ISO date string - NEW
  endDate?: string; // ISO date string - RENAMED from suggestedDeadline
  status?: SubtaskStatus;
  assignedPersonnel?: number; // NEW
  location?: string; // NEW
}

export interface Subtask extends SubtaskCore {
  id: string;
  stageId: string;
  order: number;
  createdAt: string; // ISO date string
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  createdAt: string; // ISO date string
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stages: Stage[];
  subtasks: Subtask[];
  createdAt: string; // ISO date string
  dueDate?: string; // ISO date string
  budget?: number;
  spent?: number;
  status?: ProjectStatus;
  outcomeNotes?: string;
}
