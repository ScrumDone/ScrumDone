import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '../api/projects';

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: (_result, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
