import { useQuery } from '@tanstack/react-query';
import { getSprint } from '../api/sprints';

export function useSprint(sprintId: string) {
  return useQuery({
    queryKey: ['sprints', sprintId],
    queryFn: () => getSprint(sprintId),
    enabled: Boolean(sprintId),
  });
}
