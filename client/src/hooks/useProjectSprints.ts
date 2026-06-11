import { useQuery } from '@tanstack/react-query';
import { getProjectSprints } from '../api/sprints';

export function useProjectSprints(projectId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['projects', projectId, 'sprints', { page, limit }],
    queryFn: () => getProjectSprints(projectId, { page, limit }),
    enabled: Boolean(projectId),
  });
}
