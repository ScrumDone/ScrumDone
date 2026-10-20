import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '../../api/projects';
import type { ProjectDetail, ProjectUpdateDto } from '../../types/project';

type UpdateProjectInput = {
  id: string;
  data: ProjectUpdateDto;
};

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProjectInput) => updateProject(id, data),
    onSuccess: (updatedProject, { id, data }) => {
      const modeChanged = data.isSetToScrum === true || data.isSetToScrum === false;

      if (modeChanged) {
        queryClient.setQueryData<ProjectDetail>(['projects', id], updatedProject);
      }

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });

      if (!modeChanged) return;

      queryClient.invalidateQueries({ queryKey: ['projects', id, 'sprints'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id, 'sprints', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['sprints', id] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
