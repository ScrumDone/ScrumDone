import { useCallback, useEffect, useState } from 'react';

const storageKeyFor = (projectId: string) => `project-board-sprint:${projectId}`;

const readStoredSprintId = (projectId: string | undefined): string | null => {
  if (!projectId) return null;
  return sessionStorage.getItem(storageKeyFor(projectId)) || null;
};

/**
 * Wybrany sprint tablicy projektu.
 * - wybór użytkownika → sessionStorage (przetrwa nawigację między kartami)
 * - brak wyboru → domyślny z backendu (GET /sprints/current)
 * - nie resetuje się przy przełączeniu Scrum ↔ Kanban
 */
export function useProjectBoardSprint(
  projectId: string | undefined,
  backendCurrentSprintId: string | null | undefined,
) {
  const [selectedSprintId, setSelectedSprintIdState] = useState<string | null>(() =>
    readStoredSprintId(projectId),
  );

  useEffect(() => {
    if (!projectId) {
      setSelectedSprintIdState(null);
      return;
    }

    const stored = readStoredSprintId(projectId);
    if (stored) {
      setSelectedSprintIdState(stored);
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedSprintId) return;
    if (backendCurrentSprintId) {
      setSelectedSprintIdState(backendCurrentSprintId);
    }
  }, [backendCurrentSprintId, selectedSprintId]);

  const setSelectedSprintId = useCallback(
    (sprintId: string) => {
      setSelectedSprintIdState(sprintId);
      if (projectId) {
        sessionStorage.setItem(storageKeyFor(projectId), sprintId);
      }
    },
    [projectId],
  );

  return { selectedSprintId, setSelectedSprintId };
}
