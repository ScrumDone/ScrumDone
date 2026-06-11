import { useCallback, useEffect, useState } from 'react';

export type ProjectViewMode = 'kanban' | 'scrum';

const storageKeyFor = (projectId: string) => `project-view-mode:${projectId}`;

const readStoredMode = (projectId: string | undefined): ProjectViewMode => {
  if (!projectId) return 'kanban';
  const stored = sessionStorage.getItem(storageKeyFor(projectId));
  return stored === 'scrum' ? 'scrum' : 'kanban';
};

export function useProjectViewMode(projectId: string | undefined) {
  const [viewMode, setViewMode] = useState<ProjectViewMode>(() => readStoredMode(projectId));

  useEffect(() => {
    if (!projectId) return;
    setViewMode(readStoredMode(projectId));
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    sessionStorage.setItem(storageKeyFor(projectId), viewMode);
  }, [projectId, viewMode]);

  const setProjectViewMode = useCallback((mode: ProjectViewMode) => {
    setViewMode(mode);
  }, []);

  return { viewMode, setProjectViewMode };
}
