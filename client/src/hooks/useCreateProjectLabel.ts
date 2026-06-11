import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProjectAssignmentLabel } from '../api/projects';
import type { ProjectLabelCreateDto } from '../types/project';

type CreateProjectLabelInput = {
  projectId: string;
  data: ProjectLabelCreateDto;
};

export function useCreateProjectLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: CreateProjectLabelInput) =>
      createProjectAssignmentLabel(projectId, data),
    onSuccess: (_createdLabel, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'assignment-labels'] });
    },
  });
}
