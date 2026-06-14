import type { UserSummary } from './user';

// Bazowe typy domenowe
export type AssignmentStatus = {
  id: string;
  name: string;
  hexColor: string;
};

export type AssignmentPriority = {
  id: string;
  name: string;
  hexColor: string;
};

export type AssignmentLabel = {
  id: string;
  name: string;
  hexColor: string;
};

// Modele odpowiedzi API
export type Assignment = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  timeEstimate: string;
  status: AssignmentStatus;
  priority: AssignmentPriority | null;
  assignees: UserSummary[];
  labels: AssignmentLabel[];
  subtaskIds: string[];
  projectId: string;
  projectName: string;
  sprintId: string | null;
  parentAssignmentId: string | null;
};

// DTO do tworzenia i edycji
export type CreateAssignmentDto = {
  name: string;
  description?: string;
  dueDate?: string | null;
  timeEstimate?: string;
  statusId: string;
  priorityId: string;
  assigneeIds?: string[];
  labelIds?: string[];
  projectId: string;
  sprintId?: string | null;
  parentAssignmentId?: string | null;
};

export type UpdateAssignmentDto = Partial<CreateAssignmentDto>;

// Specjalistyczne DTO dla PUT
export type AssignmentAssigneesUpdateDto = {
  assigneeIds: string[];
};

export type AssignmentLabelsUpdateDto = {
  labelIds: string[];
};

// Zapytania
export type AssignmentQueryParams = {
  SprintIds?: string[];
  ProjectIds?: string[];
  Backlog?: boolean;
  AssigneeIds?: string[];
  PriorityIds?: string[];
  StatusIds?: string[];
  LabelIds?: string[];
  DueFrom?: string; // ISO DateTime
  DueTo?: string;   // ISO DateTime
  ExcludeNoDeadline?: boolean;
  Page?: number | string;
  Limit?: number | string;
};

// Odpowiedź paginowana
export type PaginatedAssignmentsResponse = {
  items: Assignment[];
  page: string;
  pageSize: string;
  totalCount: string;
  totalPages: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};