import { useQuery } from '@tanstack/react-query';
import { getAssignments } from '../api/assignments';
import { ApiError } from '../api/client';
import type { AssignmentQueryParams, PaginatedAssignmentsResponse } from '../types/assignment';

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
    // Pamiętaj: dla paginowanych danych staleTime powinien być niski, 
    // chyba że to statyczne zestawienia
    staleTime: 1000 * 30, // 30 sekund
  });
}

// Fabryka: Kanban Column
export function useKanbanColumnAssignments(statusId: string) {
  return useAssignments({ StatusIds: [statusId] });
}

// Fabryka: Backlog
export function useBacklogAssignments() {
  return useAssignments({ Backlog: true });
}

//STALETIME: 30 sekund, ponieważ dane mogą się często zmieniać, ale nie chcemy nadmiernie obciążać serwera zapytaniami.