import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSprint } from '../api/sprints';
import type { SprintUpdateDto } from '../types/sprint';

type UpdateSprintInput = {
  id: string;
  projectId: string;
  data: SprintUpdateDto;
};

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateSprintInput) => updateSprint(id, data),
    onSuccess: (_updatedSprint, { id, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprints', id] });
    },
  });
}
