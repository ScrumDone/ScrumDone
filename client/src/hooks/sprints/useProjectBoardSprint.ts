import { useCallback, useEffect, useRef, useState } from 'react';

const storageKeyFor = (projectId: string) => `project-board-sprint:${projectId}`;

const readStoredSprintId = (projectId: string | undefined): string | null => {
  if (!projectId) return null;
  return sessionStorage.getItem(storageKeyFor(projectId)) || null;
};

export type BoardSprintList = {
  /** Undefined, dopóki projekt się nie załadował. */
  isScrum: boolean | undefined;
  sprintIds: readonly string[];
  updatedAt: number;
  isFetching: boolean;
  hasData: boolean;
  currentUpdatedAt: number;
  isCurrentFetching: boolean;
};

/**
 * Wybrany sprint tablicy projektu.
 * - wybór użytkownika → sessionStorage (przetrwa nawigację między kartami)
 * - brak wyboru → domyślny z backendu (GET /sprints/current)
 * - po zmianie Scrum ↔ Kanban zostaje, jeśli nadal jest na liście tego trybu;
 *   inaczej tablica przechodzi na bieżący sprint i nadpisuje sessionStorage
 */
export function useProjectBoardSprint(
  projectId: string | undefined,
  backendCurrentSprintId: string | null | undefined,
  list?: BoardSprintList,
) {
  const [selectedSprintId, setSelectedSprintIdState] = useState<string | null>(() =>
    readStoredSprintId(projectId),
  );

  const observedMode = useRef<boolean | undefined>(undefined);
  const staleListUpdatedAt = useRef<number | null>(null);
  const staleCurrentUpdatedAt = useRef<number | null>(null);

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

  useEffect(() => {
    if (!list || list.isScrum === undefined) return;
    if (observedMode.current === list.isScrum) return;

    const previousMode = observedMode.current;
    observedMode.current = list.isScrum;
    if (previousMode === undefined) {
      if (!list.isFetching) return;
      staleListUpdatedAt.current = list.updatedAt;
      staleCurrentUpdatedAt.current = list.currentUpdatedAt;
      return;
    }

    staleListUpdatedAt.current = list.updatedAt;
    staleCurrentUpdatedAt.current = list.currentUpdatedAt;
  }, [list]);

  useEffect(() => {
    if (!projectId || !list || list.isScrum === undefined || !list.hasData) return;
    if (list.isFetching) return;

    const staleAt = staleListUpdatedAt.current;
    if (staleAt != null && list.updatedAt <= staleAt) return;

    const stored = readStoredSprintId(projectId);
    if (stored && list.sprintIds.includes(stored)) {
      staleListUpdatedAt.current = null;
      staleCurrentUpdatedAt.current = null;
      return;
    }

    if (!stored) {
      staleListUpdatedAt.current = null;
      staleCurrentUpdatedAt.current = null;
      return;
    }

    if (list.isCurrentFetching) return;
    const staleCurrentAt = staleCurrentUpdatedAt.current;
    if (staleCurrentAt != null && list.currentUpdatedAt <= staleCurrentAt) return;
    if (!backendCurrentSprintId) return;

    staleListUpdatedAt.current = null;
    staleCurrentUpdatedAt.current = null;
    setSelectedSprintId(backendCurrentSprintId);
  }, [projectId, list, backendCurrentSprintId, setSelectedSprintId]);

  return { selectedSprintId, setSelectedSprintId };
}
