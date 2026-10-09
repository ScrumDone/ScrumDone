import { useOptimisticAssignmentUpdate } from './useOptimisticAssignmentUpdate';

export function useUpdateAssignmentStatus() {
  return useOptimisticAssignmentUpdate(
    ({ statusId }: { id: string; statusId: string }) => ({ statusId }),
    (assignment, { statusId }) => ({ ...assignment, status: { ...assignment.status, id: statusId } }),
  );
}
