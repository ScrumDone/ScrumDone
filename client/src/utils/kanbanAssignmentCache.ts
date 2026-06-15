import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Assignment, PaginatedAssignmentsResponse } from '../types/assignment';

export function findKanbanAssignment(
  queryClient: QueryClient,
  taskId: string,
): Assignment | undefined {
  const queries = queryClient.getQueriesData<InfiniteData<PaginatedAssignmentsResponse>>({
    queryKey: ['assignments', 'kanban-column'],
  });

  for (const [, data] of queries) {
    const found = data?.pages.flatMap((page) => page.items).find((item) => item.id === taskId);
    if (found) return found;
  }

  return undefined;
}

export function findKanbanStatusIdForTask(
  queryClient: QueryClient,
  taskId: string,
  optimisticStatuses: Record<string, string>,
): string | undefined {
  if (optimisticStatuses[taskId]) {
    return optimisticStatuses[taskId];
  }

  const queries = queryClient.getQueriesData<InfiniteData<PaginatedAssignmentsResponse>>({
    queryKey: ['assignments', 'kanban-column'],
  });

  for (const [queryKey, data] of queries) {
    const statusId = queryKey[2];
    if (typeof statusId !== 'string') continue;

    const found = data?.pages.some((page) => page.items.some((item) => item.id === taskId));
    if (found) return statusId;
  }

  return undefined;
}
