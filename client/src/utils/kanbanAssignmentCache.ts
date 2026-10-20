import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query';
import type { Assignment, AssignmentQueryParams, PaginatedAssignmentsResponse } from '../types/assignment';
import { insertAssignmentSorted } from './assignmentOrder';

export const ASSIGNMENT_CARD_ATTRIBUTE = 'data-assignment-id';

type AssignmentListFilters = {
  statusIds?: string[];
  sprintIds?: string[];
  projectIds?: string[];
  priorityIds?: string[];
  assigneeIds?: string[];
  labelIds?: string[];
  backlog?: boolean;
  dueFrom?: string;
  dueTo?: string;
  excludeNoDeadline?: boolean;
  page?: number;
};

export type AssignmentQuerySnapshot = Array<[QueryKey, unknown]>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isQueryParams = (value: unknown): value is AssignmentQueryParams => isRecord(value);

const isPage = (value: unknown): value is PaginatedAssignmentsResponse =>
  isRecord(value) && Array.isArray(value['items']);

const isInfinite = (value: unknown): value is InfiniteData<PaginatedAssignmentsResponse> =>
  isRecord(value) && Array.isArray(value['pages']) && value['pages'].every(isPage);

const stringIds = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const ids = value.filter((item): item is string => typeof item === 'string');
  return ids.length ? ids : undefined;
};

const filtersFromParams = (params: AssignmentQueryParams): AssignmentListFilters => {
  const filters: AssignmentListFilters = {
    page: params.Page == null ? 1 : Number(params.Page),
  };

  const statusIds = stringIds(params.StatusIds);
  const sprintIds = stringIds(params.SprintIds);
  const projectIds = stringIds(params.ProjectIds);
  const priorityIds = stringIds(params.PriorityIds);
  const assigneeIds = stringIds(params.AssigneeIds);
  const labelIds = stringIds(params.LabelIds);

  if (statusIds) filters.statusIds = statusIds;
  if (sprintIds) filters.sprintIds = sprintIds;
  if (projectIds) filters.projectIds = projectIds;
  if (priorityIds) filters.priorityIds = priorityIds;
  if (assigneeIds) filters.assigneeIds = assigneeIds;
  if (labelIds) filters.labelIds = labelIds;
  if (params.Backlog === true) filters.backlog = true;
  if (params.DueFrom) filters.dueFrom = params.DueFrom;
  if (params.DueTo) filters.dueTo = params.DueTo;
  if (params.ExcludeNoDeadline === true) filters.excludeNoDeadline = true;

  return filters;
};

const filtersFromQueryKey = (queryKey: QueryKey): AssignmentListFilters | 'skip' | 'unknown' => {
  if (queryKey[0] !== 'assignments') return 'unknown';
  if (queryKey[1] === 'calendar-day-count') return 'skip';

  if (queryKey[1] === 'kanban-column') {
    const statusId = queryKey[2];
    if (typeof statusId !== 'string') return 'unknown';
    const params = isQueryParams(queryKey[3]) ? filtersFromParams(queryKey[3]) : {};
    return { ...params, statusIds: [statusId], page: 1 };
  }

  if (queryKey[1] === 'calendar') {
    return isQueryParams(queryKey[2]) ? filtersFromParams(queryKey[2]) : 'unknown';
  }

  if (isQueryParams(queryKey[1])) {
    return filtersFromParams(queryKey[1]);
  }

  return 'unknown';
};

const matchesDueRange = (dueDate: string | null, filters: AssignmentListFilters): boolean => {
  const hasFrom = Boolean(filters.dueFrom);
  const hasTo = Boolean(filters.dueTo);

  if (!dueDate) {
    return filters.excludeNoDeadline !== true;
  }

  const time = Date.parse(dueDate);
  if (Number.isNaN(time)) return true;

  if (hasFrom) {
    const from = Date.parse(filters.dueFrom ?? '');
    if (!Number.isNaN(from) && time < from) return false;
  }

  if (hasTo) {
    const to = Date.parse(filters.dueTo ?? '');
    if (!Number.isNaN(to) && time > to) return false;
  }

  return true;
};

export const assignmentMatchesFilters = (assignment: Assignment, filters: AssignmentListFilters): boolean => {
  if (filters.projectIds?.length && !filters.projectIds.includes(assignment.projectId)) return false;
  if (filters.statusIds?.length && !filters.statusIds.includes(assignment.status.id)) return false;
  if (filters.priorityIds?.length && (!assignment.priority || !filters.priorityIds.includes(assignment.priority.id))) {
    return false;
  }
  if (filters.assigneeIds?.length && !assignment.assignees.some((assignee) => filters.assigneeIds?.includes(assignee.id))) {
    return false;
  }
  if (filters.labelIds?.length && !assignment.labels.some((label) => filters.labelIds?.includes(label.id))) {
    return false;
  }

  if (filters.backlog === true) {
    if (assignment.sprintId) return false;
  } else if (filters.sprintIds?.length) {
    if (!assignment.sprintId || !filters.sprintIds.includes(assignment.sprintId)) return false;
  }

  return matchesDueRange(assignment.dueDate, filters);
};

const toCount = (value: string | number | undefined, fallback: number): number => {
  const count = Number(value);
  return Number.isFinite(count) ? count : fallback;
};

const pageSizeOf = (page: PaginatedAssignmentsResponse | undefined, fallback: number): number => {
  const size = Number(page?.pageSize);
  if (Number.isFinite(size) && size > 0) return size;
  return fallback > 0 ? fallback : 20;
};

const findInPages = (pages: PaginatedAssignmentsResponse[], assignmentId: string): Assignment | undefined => {
  for (const page of pages) {
    const found = page.items.find((item) => item.id === assignmentId);
    if (found) return found;
  }
  return undefined;
};

const placeInLoadedItems = (
  loaded: Assignment[],
  assignment: Assignment,
  belongs: boolean,
): { items: Assignment[]; totalDelta: number } | null => {
  const without = loaded.filter((item) => item.id !== assignment.id);
  const wasPresent = without.length !== loaded.length;

  if (!belongs) {
    if (!wasPresent) return null;
    return { items: without, totalDelta: -1 };
  }

  return {
    items: insertAssignmentSorted(without, assignment),
    totalDelta: wasPresent ? 0 : 1,
  };
};

const rebuildPages = (
  pages: PaginatedAssignmentsResponse[],
  items: Assignment[],
  totalCount: number,
): PaginatedAssignmentsResponse[] => {
  const pageSize = pageSizeOf(pages[0], items.length);
  let cursor = 0;

  return pages.map((page, index) => {
    const isLast = index === pages.length - 1;
    const take = isLast ? items.length - cursor : Math.min(pageSize, items.length - cursor);
    const pageItems = items.slice(cursor, cursor + Math.max(take, 0));
    cursor += pageItems.length;

    return {
      ...page,
      items: pageItems,
      totalCount: String(totalCount),
      hasNextPage: isLast ? totalCount > cursor : cursor < totalCount,
      hasPreviousPage: index > 0,
    };
  });
};

const updatePages = (
  pages: PaginatedAssignmentsResponse[],
  assignment: Assignment,
  belongs: boolean,
  allowInsert: boolean,
): PaginatedAssignmentsResponse[] | null => {
  if (!pages.length) return null;

  const loaded = pages.flatMap((page) => page.items);
  const wasPresent = loaded.some((item) => item.id === assignment.id);

  if (!wasPresent && !allowInsert) return null;

  const placed = placeInLoadedItems(
    loaded,
    assignment,
    belongs && (wasPresent || allowInsert),
  );
  if (!placed) return null;

  const totalCount = Math.max(0, toCount(pages[0]?.totalCount, loaded.length) + placed.totalDelta);
  return rebuildPages(pages, placed.items, totalCount);
};

const updateQueryData = (
  queryKey: QueryKey,
  data: unknown,
  assignment: Assignment,
): unknown => {
  const filters = filtersFromQueryKey(queryKey);
  if (filters === 'skip') return data;

  const pages = isInfinite(data) ? data.pages : isPage(data) ? [data] : null;
  if (!pages) return data;

  const belongs = filters === 'unknown'
    ? pages.some((page) => page.items.some((item) => item.id === assignment.id))
    : assignmentMatchesFilters(assignment, filters);
  const allowInsert = filters !== 'unknown' && (filters.page ?? 1) <= 1;
  const nextPages = updatePages(pages, assignment, belongs, allowInsert);
  if (!nextPages) return data;

  if (isInfinite(data)) {
    return { ...data, pages: nextPages };
  }

  return nextPages[0];
};

const mergeAssignment = (current: Assignment, next: Assignment): Assignment => ({
  ...current,
  ...next,
  subtaskIds: next.subtaskIds?.length ? next.subtaskIds : current.subtaskIds,
  status: next.status?.id ? { ...current.status, ...next.status } : current.status,
  priority: next.priority === undefined
    ? current.priority
    : next.priority
      ? { ...current.priority, ...next.priority }
      : null,
  assignees: next.assignees ?? current.assignees,
  labels: next.labels ?? current.labels,
});

const findInQueryData = (data: unknown, assignmentId: string): Assignment | undefined => {
  if (isInfinite(data)) return findInPages(data.pages, assignmentId);
  if (isPage(data)) return data.items.find((item) => item.id === assignmentId);
  return undefined;
};

export function findAssignmentInCaches(queryClient: QueryClient, assignmentId: string): Assignment | undefined {
  const queries = queryClient.getQueriesData({ queryKey: ['assignments'] });
  for (const [, data] of queries) {
    const found = findInQueryData(data, assignmentId);
    if (found) return found;
  }
  return undefined;
}

export function findKanbanAssignment(queryClient: QueryClient, taskId: string): Assignment | undefined {
  const queries = queryClient.getQueriesData<InfiniteData<PaginatedAssignmentsResponse>>({
    queryKey: ['assignments', 'kanban-column'],
  });

  for (const [, data] of queries) {
    const found = data ? findInPages(data.pages, taskId) : undefined;
    if (found) return found;
  }

  return findAssignmentInCaches(queryClient, taskId);
}

export function findKanbanStatusIdForTask(queryClient: QueryClient, taskId: string): string | undefined {
  const queries = queryClient.getQueriesData<InfiniteData<PaginatedAssignmentsResponse>>({
    queryKey: ['assignments', 'kanban-column'],
  });

  for (const [queryKey, data] of queries) {
    const statusId = queryKey[2];
    if (typeof statusId !== 'string') continue;
    if (data && findInPages(data.pages, taskId)) return statusId;
  }

  return undefined;
}

export function snapshotAssignmentQueries(queryClient: QueryClient): AssignmentQuerySnapshot {
  return queryClient.getQueriesData({ queryKey: ['assignments'] });
}

export function restoreAssignmentQueries(queryClient: QueryClient, snapshot: AssignmentQuerySnapshot) {
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
}

export function commitAssignmentToCaches(queryClient: QueryClient, assignment: Assignment) {
  const queries = queryClient.getQueriesData({ queryKey: ['assignments'] });

  for (const [queryKey, data] of queries) {
    if (data == null) continue;
    const existing = findInQueryData(data, assignment.id);
    const merged = existing ? mergeAssignment(existing, assignment) : assignment;
    const next = updateQueryData(queryKey, data, merged);
    if (next !== data) {
      queryClient.setQueryData(queryKey, next);
    }
  }
}

export function animateAssignmentRollback(assignmentId: string, restore: () => void) {
  if (typeof document === 'undefined') {
    restore();
    return;
  }

  const selector = `[${ASSIGNMENT_CARD_ATTRIBUTE}="${CSS.escape(assignmentId)}"]`;
  const first = document.querySelector(selector)?.getBoundingClientRect();
  restore();

  if (!first) return;

  const animateBack = (attempt: number) => {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLElement)) return;

    const last = element.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      if (attempt < 4) {
        window.requestAnimationFrame(() => animateBack(attempt + 1));
      }
      return;
    }

    element.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: 250, easing: 'ease' },
    );
  };

  window.requestAnimationFrame(() => animateBack(0));
}
