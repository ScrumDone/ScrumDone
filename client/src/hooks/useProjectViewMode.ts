import { useCallback, useEffect, useState } from 'react';

export type ProjectViewMode = 'kanban' | 'scrum';

const storageKeyFor = (projectSlug: string) => `project-view-mode:${projectSlug}`;

const readStoredMode = (projectSlug: string | undefined): ProjectViewMode => {
  if (!projectSlug) return 'kanban';
  const stored = sessionStorage.getItem(storageKeyFor(projectSlug));
  return stored === 'scrum' ? 'scrum' : 'kanban';
};

export function useProjectViewMode(projectSlug: string | undefined) {
  const [viewMode, setViewMode] = useState<ProjectViewMode>(() => readStoredMode(projectSlug));

  useEffect(() => {
    if (!projectSlug) return;
    setViewMode(readStoredMode(projectSlug));
  }, [projectSlug]);

  useEffect(() => {
    if (!projectSlug) return;
    sessionStorage.setItem(storageKeyFor(projectSlug), viewMode);
  }, [projectSlug, viewMode]);

  const setProjectViewMode = useCallback((mode: ProjectViewMode) => {
    setViewMode(mode);
  }, []);

  return { viewMode, setProjectViewMode };
}
