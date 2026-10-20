import { useEffect, useState } from 'react';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { updateAssignment } from '../../api/assignments';
import type { Assignment, AssignmentStatus, UpdateAssignmentDto } from '../../types/assignment';
import {
  animateAssignmentRollback,
  commitAssignmentToCaches,
  findAssignmentInCaches,
  restoreAssignmentQueries,
  snapshotAssignmentQueries,
} from '../../utils/kanbanAssignmentCache';

type AssignmentUpdateVariables = { id: string };

type MoveNoticeListener = (message: string | null) => void;

const moveNoticeListeners = new Set<MoveNoticeListener>();
let moveNoticeTimer: ReturnType<typeof setTimeout> | null = null;

export const ASSIGNMENT_MOVE_ERROR_MESSAGE =
  'Nie udało się przenieść zadania. Karta wróciła na swoje miejsce.';

export function reportAssignmentMoveError(message: string | null) {
  if (moveNoticeTimer) {
    clearTimeout(moveNoticeTimer);
    moveNoticeTimer = null;
  }

  moveNoticeListeners.forEach((listener) => listener(message));

  if (!message) return;

  moveNoticeTimer = setTimeout(() => {
    moveNoticeTimer = null;
    moveNoticeListeners.forEach((listener) => listener(null));
  }, 6000);
}

export function useAssignmentMoveNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    moveNoticeListeners.add(setMessage);
    return () => {
      moveNoticeListeners.delete(setMessage);
    };
  }, []);

  return message;
}

const resolveStatus = (queryClient: QueryClient, assignment: Assignment): Assignment => {
  const pools = [
    queryClient.getQueryData<AssignmentStatus[]>(['assignment-statuses']),
    queryClient.getQueryData<AssignmentStatus[]>(['statuses']),
  ];

  for (const pool of pools) {
    const match = pool?.find((status) => status.id === assignment.status.id);
    if (!match) continue;

    return {
      ...assignment,
      status: { ...assignment.status, ...match },
    };
  }

  return assignment;
};

// Wspólny szkielet mutacji PATCH /assignments/{id}.
// Stan tablicy aktualizujemy od razu w cache, a po sukcesie wstawiamy obiekt z odpowiedzi,
// bez ponownego pobierania całej listy.
export function useOptimisticAssignmentUpdate<TVariables extends AssignmentUpdateVariables>(
  toUpdateDto: (variables: TVariables) => UpdateAssignmentDto,
  applyToAssignment: (assignment: Assignment, variables: TVariables) => Assignment,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => updateAssignment(variables.id, toUpdateDto(variables)),

    onMutate: (variables) => {
      // Przerwij trwające pobierania list, które już coś pokazują.
      // revert przywraca dane sprzed fetcha, a zaraz potem nadpisujemy je ruchem karty.
      // Puste zapytania (pierwsze ładowanie) zostawiamy, żeby nie utknęły bez danych.
      for (const query of queryClient.getQueryCache().findAll({ queryKey: ['assignments'] })) {
        if (query.state.data !== undefined) {
          void query.cancel({ revert: true });
        }
      }

      const previousAssignments = snapshotAssignmentQueries(queryClient);
      const current = findAssignmentInCaches(queryClient, variables.id);

      if (current) {
        const next = resolveStatus(queryClient, applyToAssignment(current, variables));
        commitAssignmentToCaches(queryClient, next);
      }

      reportAssignmentMoveError(null);
      return { previousAssignments };
    },

    onSuccess: (updated) => {
      commitAssignmentToCaches(queryClient, updated);
      queryClient.setQueryData(['assignment', updated.id], (current: Assignment | undefined) =>
        current
          ? {
              ...current,
              ...updated,
              subtaskIds: updated.subtaskIds?.length ? updated.subtaskIds : current.subtaskIds,
            }
          : updated,
      );
    },

    onError: (_error, variables, context) => {
      if (!context) return;

      animateAssignmentRollback(variables.id, () => {
        restoreAssignmentQueries(queryClient, context.previousAssignments);
      });
      reportAssignmentMoveError(ASSIGNMENT_MOVE_ERROR_MESSAGE);
    },
  });
}
