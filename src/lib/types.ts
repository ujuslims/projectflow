
export type ProjectStatus = 'Not Started' | 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type SubtaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Blocked';

export interface SubtaskCore {
  name: string;
  description?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  status?: SubtaskStatus;
  assignedPersonnel?: number;
  location?: string;
  // Industry-specific fields for Subtask
  fieldCrewLead?: string;
  equipmentUsed?: string; // Comma-separated or list
  dataDeliverables?: string; // Comma-separated or list
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
  // Industry-specific fields for Project
  projectNumber?: string;
  clientContact?: string;
  siteAddress?: string;
  coordinateSystem?: string;
  projectType?: string; // Added for stage templates
}
