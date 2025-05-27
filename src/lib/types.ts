export interface SubtaskCore {
  name: string;
  description?: string;
  suggestedDeadline?: string; // ISO date string
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
}
