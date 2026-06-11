import { useQuery } from '@tanstack/react-query';
import { getPriorities } from '../api/assignments';
import { ApiError } from '../api/client';
import type { AssignmentPriority } from '../types/assignment';

export function useAssignmentPriorities() {
  return useQuery<AssignmentPriority[], ApiError>({
    queryKey: ['assignment-priorities'],
    queryFn: () => getPriorities(),
    staleTime: 1000 * 60 * 60, // 1 godzina
    gcTime: 1000 * 60 * 60,
  });
}