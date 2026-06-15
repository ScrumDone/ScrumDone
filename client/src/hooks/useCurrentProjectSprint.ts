import { useQuery } from '@tanstack/react-query';
import { getCurrentProjectSprint } from '../api/sprints';

/**
 * Aktywny sprint projektu wg backendu (kanbanowy lub scrumowy — zależnie od isSetToScrum).
 * GET /api/projects/{id}/sprints/current
 */
export function useCurrentProjectSprint(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'sprints', 'current'],
    queryFn: async () => {
      const sprint = await getCurrentProjectSprint(projectId);
      return sprint ?? null;
    },
    enabled: Boolean(projectId),
    staleTime: 0,
  });
}
