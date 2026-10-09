import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAssignment, getAssignments, getPriorities, getStatuses } from '../api/assignments';
import { ApiError } from '../api/client';
import type { AssignmentQueryParams, PaginatedAssignmentsResponse } from '../types/assignment';
import { useOptimisticAssignmentUpdate } from './useOptimisticAssignmentUpdate';

// Zadania często się zmieniają, ale nie chcemy odpytywać serwera przy każdym renderze
export const ASSIGNMENTS_STALE_TIME = 1000 * 30;

export const KANBAN_COLUMN_PAGE_SIZE = 20;

export const useStatuses = () => useQuery({ queryKey: ['statuses'], queryFn: getStatuses });
export const usePriorities = () => useQuery({ queryKey: ['priorities'], queryFn: getPriorities });

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });
};

export function useAssignments(params: AssignmentQueryParams = {}) {
  // Domyślne wartości, jeśli nie zostały przekazane
  const safeParams = {
    Page: params.Page ?? 1,
    Limit: params.Limit ?? 20,
    ...params,
  };

  return useQuery<PaginatedAssignmentsResponse, ApiError>({
    queryKey: ['assignments', safeParams],
    queryFn: () => getAssignments(safeParams),
    staleTime: ASSIGNMENTS_STALE_TIME,
  });
}

// Kolumna Kanbana - osobna paginacja dla każdego statusu
export function useKanbanColumnAssignments(
  statusId: string,
  baseParams: AssignmentQueryParams,
  enabled = true,
) {
  const columnParams = {
    Limit: KANBAN_COLUMN_PAGE_SIZE,
    ...baseParams,
  };

  return useInfiniteQuery<PaginatedAssignmentsResponse, ApiError>({
    queryKey: ['assignments', 'kanban-column', statusId, columnParams],
    queryFn: ({ pageParam }) =>
      getAssignments({
        ...columnParams,
        StatusIds: [statusId],
        Page: typeof pageParam === 'number' ? pageParam : Number(pageParam),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? Number(lastPage.page) + 1 : undefined,
    enabled: enabled && Boolean(statusId),
    staleTime: ASSIGNMENTS_STALE_TIME,
  });
}

export function useBacklogAssignments() {
  return useAssignments({ Backlog: true });
}

export function useUpdateAssignmentDueDate() {
  return useOptimisticAssignmentUpdate(
    ({ dueDate }: { id: string; dueDate: string | null }) => ({ dueDate }),
    (assignment, { dueDate }) => ({ ...assignment, dueDate }),
  );
}
