import { useQuery } from '@tanstack/react-query';
import { getProjectAssignmentLabels } from '../api/projects';

/** Lista etykiet projektu — używana m.in. w B6/B7 (TaskLabels, filtry). */
export function useProjectLabels(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'assignment-labels'],
    queryFn: () => getProjectAssignmentLabels(projectId),
    enabled: Boolean(projectId),
  });
}
