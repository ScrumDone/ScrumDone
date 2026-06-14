import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssignment } from '../api/assignments';
import type { UpdateAssignmentDto } from '../types/assignment';
import { withAssignmentsApiLog } from '../utils/assignmentsApiDebug';

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentDto }) =>
      withAssignmentsApiLog('Edytuj zadanie (PATCH)', { id, data }, () => updateAssignment(id, data)),
    onSuccess: (response, { id }) => {
      if (import.meta.env.DEV) {
        console.log('[Kanban] Zadanie zaktualizowane:', id, response);
      }
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
