import { useOptimisticAssignmentUpdate } from './useOptimisticAssignmentUpdate';

export function useUpdateAssignmentSprint() {
  return useOptimisticAssignmentUpdate(
    ({ sprintId }: { id: string; sprintId: string | null }) => ({ sprintId }),
    (assignment, { sprintId }) => ({ ...assignment, sprintId }),
  );
}
