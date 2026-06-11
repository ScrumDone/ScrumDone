import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProjectMembers } from '../api/projects';
import type { ProjectMembersUpdateDto } from '../types/project';

type UpdateProjectMembersInput = {
  id: string;
  data: ProjectMembersUpdateDto;
};

export function useUpdateProjectMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProjectMembersInput) => updateProjectMembers(id, data),
    onSuccess: (_memberIds, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}
