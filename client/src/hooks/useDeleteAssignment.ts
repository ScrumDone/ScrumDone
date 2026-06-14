import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAssignment } from '../api/assignments';
import { withAssignmentsApiLog } from '../utils/assignmentsApiDebug';

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      withAssignmentsApiLog('Usuń zadanie (DELETE)', { id }, () => deleteAssignment(id)),
    onSuccess: (_data, id) => {
      if (import.meta.env.DEV) {
        console.log('[Kanban] Zadanie usunięte:', id);
      }
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
