import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSprint } from '../api/sprints';
import type { SprintCreateDto } from '../types/sprint';

type CreateSprintInput = {
  projectId: string;
  data: SprintCreateDto;
};

export function useCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: CreateSprintInput) => createSprint(projectId, data),
    onSuccess: (_createdSprint, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sprints'] });
    },
  });
}
