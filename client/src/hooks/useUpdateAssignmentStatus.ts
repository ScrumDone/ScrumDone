import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssignment } from '../api/assignments';
import type { Assignment } from '../types/assignment';

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statusId }: { id: string; statusId: string }) => 
      updateAssignment(id, { statusId }),

    onMutate: async ({ id, statusId }) => {
      // 1. Anuluj nadchodzące refetch'e
      await queryClient.cancelQueries({ queryKey: ['assignments'] });

      // 2. Zapamiętaj stan sprzed zmiany (do rollbacku w razie błędu)
      const previousAssignments = queryClient.getQueryData(['assignments']);

      // 3. Optimistic Update: Zmień stan w cache lokalnym
      queryClient.setQueryData(['assignments'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((a: Assignment) => 
            a.id === id ? { ...a, status: { ...a.status, id: statusId } } : a
          )
        };
      });

      return { previousAssignments };
    },
    onError: (_err, _newTodo, context) => {
      // W razie błędu przywróć poprzedni stan
      queryClient.setQueryData(['assignments'], context?.previousAssignments);
    },
    onSettled: () => {
      // Odśwież dane z serwera
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}