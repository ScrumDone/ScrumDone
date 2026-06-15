import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type { PagedResult } from '../types/api';
import type {
  ProjectAssignmentLabel,
  ProjectCreateDto,
  ProjectDetail,
  ProjectLabelCreateDto,
  ProjectLabelUpdateDto,
  ProjectListItem,
  ProjectQueryParams,
  ProjectUpdateDto,
} from '../types/project';
import type { UserSummary } from '../types/user';

export function getProjects(params: ProjectQueryParams = {}) {
  const { page = 1, limit = 10, companyId, userId, isActive } = params;
  return apiGet<PagedResult<ProjectListItem>>('/api/projects', {
    page,
    limit,
    companyId,
    userId,
    isActive,
  });
}

export function getProject(id: string) {
  return apiGet<ProjectDetail>(`/api/projects/${id}`);
}

export function createProject(data: ProjectCreateDto) {
  return apiPost<ProjectDetail, ProjectCreateDto>('/api/projects', data);
}

export function updateProject(id: string, data: ProjectUpdateDto) {
  return apiPatch<ProjectDetail, ProjectUpdateDto>(`/api/projects/${id}`, data);
}

export function deleteProject(id: string) {
  return apiDelete(`/api/projects/${id}`);
}

export function getProjectMembers(id: string) {
  return apiGet<UserSummary[]>(`/api/projects/${id}/members`);
}

export function addProjectMember(projectId: string, userId: string) {
  return apiPost<UserSummary, Record<string, never>>(
    `/api/projects/${projectId}/members/${userId}`,
    {},
  );
}

export function removeProjectMember(projectId: string, userId: string) {
  return apiDelete(`/api/projects/${projectId}/members/${userId}`);
}

export async function syncProjectMembers(
  projectId: string,
  currentUserIds: string[],
  nextUserIds: string[],
): Promise<void> {
  const current = new Set(currentUserIds);
  const next = new Set(nextUserIds);
  const toRemove = currentUserIds.filter((id) => !next.has(id));
  const toAdd = nextUserIds.filter((id) => !current.has(id));

  for (const userId of toRemove) {
    await removeProjectMember(projectId, userId);
  }

  for (const userId of toAdd) {
    await addProjectMember(projectId, userId);
  }
}

export function getProjectAssignmentLabels(projectId: string) {
  return apiGet<ProjectAssignmentLabel[]>(`/api/projects/${projectId}/assignment-labels`);
}

export function createProjectAssignmentLabel(projectId: string, data: ProjectLabelCreateDto) {
  return apiPost<ProjectAssignmentLabel, ProjectLabelCreateDto>(
    `/api/projects/${projectId}/assignment-labels`,
    data,
  );
}

export function updateProjectAssignmentLabel(
  projectId: string,
  labelId: string,
  data: ProjectLabelUpdateDto,
) {
  return apiPatch<ProjectAssignmentLabel, ProjectLabelUpdateDto>(
    `/api/projects/${projectId}/assignment-labels/${labelId}`,
    data,
  );
}

export function deleteProjectAssignmentLabel(projectId: string, labelId: string) {
  return apiDelete(`/api/projects/${projectId}/assignment-labels/${labelId}`);
}
