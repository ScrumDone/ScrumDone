// src/hooks/useSprints.ts
import { useQuery } from '@tanstack/react-query';
import { getProjectSprints } from '../api/sprints';

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => getProjectSprints(projectId),
    enabled: !!projectId, // Zapytanie wykona się tylko, gdy mamy projectId
  });
}