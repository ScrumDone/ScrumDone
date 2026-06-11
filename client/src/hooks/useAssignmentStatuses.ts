import { useQuery } from '@tanstack/react-query';
import { getStatuses } from '../api/assignments';
import { ApiError } from '../api/client';
import type { AssignmentStatus } from '../types/assignment';

export function useAssignmentStatuses() {
  return useQuery<AssignmentStatus[], ApiError>({
    queryKey: ['assignment-statuses'],
    queryFn: () => getStatuses(),
    staleTime: 1000 * 60 * 60, // 1 godzina
    gcTime: 1000 * 60 * 60,
  });
}