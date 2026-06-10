import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '../api/projects';
import type { ProjectCreateDto } from '../types/project';

type CreateProjectInput = {
  data: ProjectCreateDto;
};

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
