import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProjectAssignmentLabel } from '../api/projects';
import type { ProjectLabelUpdateDto } from '../types/project';

type UpdateProjectLabelInput = {
  projectId: string;
  labelId: string;
  data: ProjectLabelUpdateDto;
};

export function useUpdateProjectLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, labelId, data }: UpdateProjectLabelInput) =>
      updateProjectAssignmentLabel(projectId, labelId, data),
    onSuccess: (_updatedLabel, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'assignment-labels'] });
    },
  });
}
