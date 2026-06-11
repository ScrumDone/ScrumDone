import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProjectAssignmentLabel } from '../api/projects';

type DeleteProjectLabelInput = {
  projectId: string;
  labelId: string;
};

/** Usuwa etykietę projektu — invaliduje listę z useProjectLabels (B6/B7). */
export function useDeleteProjectLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, labelId }: DeleteProjectLabelInput) =>
      deleteProjectAssignmentLabel(projectId, labelId),
    onSuccess: (_result, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'assignment-labels'] });
    },
  });
}
