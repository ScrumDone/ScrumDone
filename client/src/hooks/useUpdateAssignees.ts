import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssignees } from '../api/assignments';
import type { Assignment, AssignmentAssigneesUpdateDto } from '../types/assignment';
import { withAssignmentsApiLog } from '../utils/assignmentsApiDebug';

export function useUpdateAssignees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignmentAssigneesUpdateDto }) =>
      withAssignmentsApiLog('Zmień przypisane osoby (PUT)', { id, data }, () => updateAssignees(id, data)),
    onSuccess: (response, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[Kanban] Osoby przypisane zaktualizowane:', id);
      }
      queryClient.setQueryData(['assignment', id], (old: Assignment | undefined) =>
        old ? { ...old, assignees: response } : old,
      );
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
