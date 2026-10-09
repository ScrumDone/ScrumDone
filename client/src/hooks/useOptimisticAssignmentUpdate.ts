import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssignment } from '../api/assignments';
import type { Assignment, PaginatedAssignmentsResponse, UpdateAssignmentDto } from '../types/assignment';

type AssignmentUpdateVariables = { id: string };

// Wspólny szkielet mutacji PATCH /assignments/{id} z optymistyczną aktualizacją cache
export function useOptimisticAssignmentUpdate<TVariables extends AssignmentUpdateVariables>(
  toUpdateDto: (variables: TVariables) => UpdateAssignmentDto,
  applyToAssignment: (assignment: Assignment, variables: TVariables) => Assignment,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => updateAssignment(variables.id, toUpdateDto(variables)),

    onMutate: async (variables) => {
      // Anuluj trwające refetche, żeby nie nadpisały optymistycznego stanu
      await queryClient.cancelQueries({ queryKey: ['assignments'] });

      const previousAssignments = queryClient.getQueryData(['assignments']);

      queryClient.setQueryData(['assignments'], (old: PaginatedAssignmentsResponse | undefined) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((a) => (a.id === variables.id ? applyToAssignment(a, variables) : a)),
        };
      });

      return { previousAssignments };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['assignments'], context?.previousAssignments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
