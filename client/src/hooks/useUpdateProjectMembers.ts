import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncProjectMembers } from '../api/projects';

type UpdateProjectMembersInput = {
  id: string;
  userIds: string[];
  currentUserIds: string[];
};

export function useUpdateProjectMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userIds, currentUserIds }: UpdateProjectMembersInput) =>
      syncProjectMembers(id, currentUserIds, userIds),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}
