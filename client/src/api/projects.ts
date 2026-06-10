import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './client';
import type { PagedResult } from '../types/api';
import type {
  ProjectAssignmentLabel,
  ProjectCreateDto,
  ProjectDetail,
  ProjectLabelCreateDto,
  ProjectLabelUpdateDto,
  ProjectListItem,
  ProjectMembersUpdateDto,
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

export function updateProjectMembers(id: string, data: ProjectMembersUpdateDto) {
  return apiPut<string[], ProjectMembersUpdateDto>(`/api/projects/${id}/members`, data);
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
