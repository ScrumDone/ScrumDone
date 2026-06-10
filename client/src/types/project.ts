import type { SprintSummary } from './sprint';
import type { UserSummary } from './user';

export type AssignmentStatusCount = {
  statusId: string;
  statusName: string;
  statusHexColor: string;
  count: number;
};

export type ProjectListItem = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isSetToScrum: boolean;
  createdAt: string;
  updatedAt: string;
  startDate: string | null;
  expectedFinishDate: string | null;
  companyId: string | null;
  companyName: string | null;
  teamMemberCount: number;
  assignmentCount: number;
  assignmentStatusCounts: AssignmentStatusCount[];
};

export type ProjectDetail = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isSetToScrum: boolean;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  expectedFinishDate: string | null;
  companyId: string | null;
  companyName: string | null;
  teamMemberCount: number;
  assignmentCount: number;
  assignmentStatusCounts: AssignmentStatusCount[];
  teamMembers: UserSummary[];
  sprints: SprintSummary[];
};

export type ProjectCreateDto = {
  name: string;
  description?: string;
  isSetToScrum?: boolean;
  startDate?: string | null;
  expectedFinishDate?: string | null;
  companyId?: string | null;
  teamMemberIds: string[];
};

export type ProjectUpdateDto = {
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  isSetToScrum?: boolean | null;
  startDate?: string | null;
  expectedFinishDate?: string | null;
  companyId?: string | null;
};

export type ProjectQueryParams = {
  page?: number;
  limit?: number;
  companyId?: string;
  userId?: string;
  isActive?: boolean;
};

export type ProjectMembersUpdateDto = {
  userIds: string[];
};

/** Project-scoped task label (GET/POST/PATCH /projects/{id}/assignment-labels). */
export type ProjectAssignmentLabel = {
  id: string;
  name: string;
  hexColor: string;
};

export type ProjectLabelCreateDto = {
  name: string;
  hexColor: string;
};

export type ProjectLabelUpdateDto = {
  name?: string | null;
  hexColor?: string | null;
};
