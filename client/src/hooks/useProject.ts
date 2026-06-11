import { useQuery } from '@tanstack/react-query';
import { getProject } from '../api/projects';

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });
}
