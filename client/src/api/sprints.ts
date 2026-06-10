import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type { PagedResult } from '../types/api';
import type {
  SprintCreateDto,
  SprintDetail,
  SprintQueryParams,
  SprintSummary,
  SprintUpdateDto,
} from '../types/sprint';

export function getProjectSprints(projectId: string, params: SprintQueryParams = {}) {
  const { page = 1, limit = 10 } = params;
  return apiGet<PagedResult<SprintSummary>>(`/api/projects/${projectId}/sprints`, {
    page,
    limit,
  });
}

export function createSprint(projectId: string, data: SprintCreateDto) {
  return apiPost<SprintSummary, SprintCreateDto>(`/api/projects/${projectId}/sprints`, data);
}

export function getSprint(id: string) {
  return apiGet<SprintDetail>(`/api/sprints/${id}`);
}

export function updateSprint(id: string, data: SprintUpdateDto) {
  return apiPatch<SprintDetail, SprintUpdateDto>(`/api/sprints/${id}`, data);
}

export function deleteSprint(id: string) {
  return apiDelete(`/api/sprints/${id}`);
}
