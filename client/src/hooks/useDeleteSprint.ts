import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSprint } from '../api/sprints';

type DeleteSprintInput = {
  id: string;
  projectId: string;
};

export function useDeleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteSprintInput) => deleteSprint(id),
    onSuccess: (_result, { id, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sprints'] });
      queryClient.removeQueries({ queryKey: ['sprints', id] });
    },
  });
}
