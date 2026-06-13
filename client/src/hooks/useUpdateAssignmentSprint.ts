// src/hooks/useUpdateAssignmentSprint.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssignment } from '../api/assignments';
import type { Assignment } from '../types/assignment';

export function useUpdateAssignmentSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sprintId }: { id: string; sprintId: string | null }) => 
      updateAssignment(id, { sprintId }),

    onMutate: async ({ id, sprintId }) => {
      // Anuluj refetch, aby uniknąć nadpisania optymistycznego stanu
      await queryClient.cancelQueries({ queryKey: ['assignments'] });

      // Zapamiętaj stan przed zmianą
      const previousAssignments = queryClient.getQueryData(['assignments']);

      // Optimistic Update
      queryClient.setQueryData(['assignments'], (old: any) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          items: old.items.map((a: Assignment) => 
            a.id === id ? { ...a, sprintId } : a
          )
        };
      });

      return { previousAssignments };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(['assignments'], context?.previousAssignments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}