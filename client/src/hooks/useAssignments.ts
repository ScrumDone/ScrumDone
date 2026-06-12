import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAssignments, updateAssignment } from '../api/assignments';
import { ApiError } from '../api/client';
import type { Assignment, AssignmentQueryParams, PaginatedAssignmentsResponse } from '../types/assignment'; // ZMIANA!!!!! - dodałem Assignment

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

export function useUpdateAssignmentDueDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dueDate }: { id: string; dueDate: string | null }) => 
      updateAssignment(id, { dueDate }),

    onMutate: async ({ id, dueDate }) => {
      // 1. Anuluj nadchodzące refetch'e, aby nie nadpisały optymistycznego stanu
      await queryClient.cancelQueries({ queryKey: ['assignments'] });

      // 2. Zapamiętaj stan sprzed zmiany
      const previousAssignments = queryClient.getQueryData(['assignments']);

      // 3. Optymistyczna aktualizacja w cache
      queryClient.setQueryData(['assignments'], (old: PaginatedAssignmentsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((a: Assignment) => 
            a.id === id ? { ...a, dueDate } : a
          )
        };
      });

      return { previousAssignments };
    },
    onError: (_err, _newTodo, context) => {
      // Przywróć poprzedni stan w razie błędu
      queryClient.setQueryData(['assignments'], context?.previousAssignments);
    },
    onSettled: () => {
      // Odśwież dane z serwera po zakończeniu
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}