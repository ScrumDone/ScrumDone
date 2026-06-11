import { useCallback, useEffect, useState } from 'react';
import {
  getDefaultSelectedSprintId,
  type SprintSelectorViewModel,
} from '../utils/sprintDisplay';

const storageKeyFor = (projectId: string) => `project-selected-sprint:${projectId}`;

const readStoredSprintId = (projectId: string | undefined): string | null => {
  if (!projectId) {
    return null;
  }

  const stored = sessionStorage.getItem(storageKeyFor(projectId));
  return stored || null;
};

/**
 * Wybrany sprint projektu (Kanban / Scrum).
 * Używane w A6 (SprintSelector) i B3 (filtr zadań na Kanbanie).
 */
export function useSelectedProjectSprint(
  projectId: string | undefined,
  sprints: SprintSelectorViewModel[] = [],
) {
  const [selectedSprintId, setSelectedSprintIdState] = useState<string | null>(() =>
    readStoredSprintId(projectId),
  );

  useEffect(() => {
    if (!projectId) {
      setSelectedSprintIdState(null);
      return;
    }

    setSelectedSprintIdState(readStoredSprintId(projectId));
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !selectedSprintId) {
      return;
    }

    sessionStorage.setItem(storageKeyFor(projectId), selectedSprintId);
  }, [projectId, selectedSprintId]);

  useEffect(() => {
    if (sprints.length === 0) {
      return;
    }

    setSelectedSprintIdState((current) => {
      if (current && sprints.some((sprint) => sprint.id === current)) {
        return current;
      }

      return getDefaultSelectedSprintId(sprints);
    });
  }, [sprints]);

  const setSelectedSprintId = useCallback((sprintId: string) => {
    setSelectedSprintIdState(sprintId);
  }, []);

  return { selectedSprintId, setSelectedSprintId };
}
