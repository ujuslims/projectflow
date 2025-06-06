
export type ProjectStatus = 'Not Started' | 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type SubtaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Blocked';

export interface EquipmentItem {
  name: string;
  model: string;
}

export interface PersonnelItem {
  name: string;
  role: string;
}

export interface ProjectOutcomes {
  keyFindings?: string;
  conclusions?: string;
  recommendations?: string;
  achievements?: string;
  challenges?: string;
  lessonsLearned?: string;
}

export interface SubtaskCore {
  name: string;
  description?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  status?: SubtaskStatus;
  assignedPersonnel?: number;
  location?: string;
  cost?: number; // Cost associated with this subtask
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

export interface ProjectType { // Added this interface for clarity
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string; // This is the Scope of Work
  stages: Stage[];
  subtasks: Subtask[];
  createdAt: string; // ISO date string - when record created in this system
  startDate?: string; // ISO date string - actual project start date
  dueDate?: string; // ISO date string
  budget?: number;
  spent?: number; // This will now be a calculated sum of subtask costs
  outcomes?: ProjectOutcomes;
  expectedDeliverables?: string;
  // Industry-specific fields for Project
  projectNumber?: string;
  clientContact?: string;
  siteAddress?: string;
  coordinateSystem?: string;
  projectTypes?: string[];
  customProjectTypes?: string[];
  equipmentList?: EquipmentItem[];
  personnelList?: PersonnelItem[];
  otherResources?: string[]; // New field for other resources
  userId?: string; // To associate project with a user
}

// Form data types for Auth
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword?: string; // confirmPassword might not be strictly needed by Firebase but good for UI
}

export interface LoginFormData {
  email: string;
  password: string;
}

