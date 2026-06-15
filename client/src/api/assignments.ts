import { apiGet, apiPost, apiPatch, apiPut, apiDelete, type QueryParamValue } from './client';
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

function assignmentQueryToParams(params: AssignmentQueryParams): Record<string, QueryParamValue> {
  const result: Record<string, QueryParamValue> = {};

  if (params.Page != null) result['page'] = params.Page;
  if (params.Limit != null) {
    const parsedLimit = Number(params.Limit);
    result['limit'] = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : params.Limit;
  }
  if (params.Backlog != null) result['backlog'] = params.Backlog;
  if (params.ExcludeNoDeadline != null) result['excludeNoDeadline'] = params.ExcludeNoDeadline;
  if (params.DueFrom) result['dueOnOrAfter'] = params.DueFrom;
  if (params.DueTo) result['dueOnOrBefore'] = params.DueTo;
  if (params.ProjectIds?.length) result['projectIds'] = params.ProjectIds;
  if (params.SprintIds?.length) result['sprintIds'] = params.SprintIds;
  if (params.AssigneeIds?.length) result['assigneeIds'] = params.AssigneeIds;
  if (params.PriorityIds?.length) result['priorityIds'] = params.PriorityIds;
  if (params.StatusIds?.length) result['statusIds'] = params.StatusIds;
  if (params.LabelIds?.length) result['labelIds'] = params.LabelIds;

  return result;
}

export const getAssignments = (params?: AssignmentQueryParams) => {
  return apiGet<PaginatedAssignmentsResponse>('/api/assignments', params ? assignmentQueryToParams(params) : undefined);
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
