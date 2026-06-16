import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '../api/projects';
import type { ProjectUpdateDto } from '../types/project';

type UpdateProjectInput = {
  id: string;
  data: ProjectUpdateDto;
};

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProjectInput) => updateProject(id, data),
    onSuccess: (_updatedProject, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });

      if (data.isSetToScrum !== undefined && data.isSetToScrum !== null) {
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.invalidateQueries({ queryKey: ['projects', id, 'sprints'] });
      }
    },
  });
}
