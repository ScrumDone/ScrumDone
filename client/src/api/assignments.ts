import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './client';
import type { 
  Assignment, 
  PaginatedAssignmentsResponse, 
  CreateAssignmentDto, 
  UpdateAssignmentDto,
  AssignmentAssigneesUpdateDto,
  AssignmentLabelsUpdateDto,
  AssignmentStatus,
  AssignmentPriority,
  AssignmentQueryParams
} from '../types/assignment';

export const getAssignments = (params?: AssignmentQueryParams) => {
  return apiGet<PaginatedAssignmentsResponse>('/api/assignments', params as any);
};

export const getAssignment = (id: string) => {
  return apiGet<Assignment>(`/api/assignments/${id}`);
};

export const createAssignment = (data: CreateAssignmentDto) => {
  return apiPost<Assignment, CreateAssignmentDto>('/api/assignments', data);
};

export const updateAssignment = (id: string, data: UpdateAssignmentDto) => {
  return apiPatch<Assignment, UpdateAssignmentDto>(`/api/assignments/${id}`, data);
};

export const deleteAssignment = (id: string) => {
  return apiDelete(`/api/assignments/${id}`);
};

export const updateAssignees = (id: string, data: AssignmentAssigneesUpdateDto) => {
  return apiPut<any, AssignmentAssigneesUpdateDto>(`/api/assignments/${id}/assignees`, data);
};

export const updateLabels = (id: string, data: AssignmentLabelsUpdateDto) => {
  return apiPut<any, AssignmentLabelsUpdateDto>(`/api/assignments/${id}/labels`, data);
};

export const getStatuses = () => {
  return apiGet<AssignmentStatus[]>('/api/assignments/statuses');
};

export const getPriorities = () => {
  return apiGet<AssignmentPriority[]>('/api/assignments/priorities');
};