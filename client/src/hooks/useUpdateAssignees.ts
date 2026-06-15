import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssignees } from '../api/assignments';
import type { AssignmentAssigneesUpdateDto } from '../types/assignment';
import { withAssignmentsApiLog } from '../utils/assignmentsApiDebug';

export function useUpdateAssignees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignmentAssigneesUpdateDto }) =>
      withAssignmentsApiLog('Zmień przypisane osoby (PUT)', { id, data }, () => updateAssignees(id, data)),
    onSuccess: (_response, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[Kanban] Osoby przypisane zaktualizowane:', id);
      }
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
