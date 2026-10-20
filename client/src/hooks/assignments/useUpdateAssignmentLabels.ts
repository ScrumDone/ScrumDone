import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLabels } from '../../api/assignments';
import type { Assignment } from '../../types/assignment';

type UpdateAssignmentLabelsInput = {
  assignmentId: string;
  labelIds: string[];
};

export function useUpdateAssignmentLabels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, labelIds }: UpdateAssignmentLabelsInput) =>
      updateLabels(assignmentId, { labelIds }),
    onSuccess: (labels, { assignmentId }) => {
      queryClient.setQueryData(['assignment', assignmentId], (current: Assignment | undefined) =>
        current ? { ...current, labels } : current,
      );
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
