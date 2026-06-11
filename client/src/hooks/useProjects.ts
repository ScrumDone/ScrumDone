import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../api/projects';
import type { ProjectQueryParams } from '../types/project';

export function useProjects(params: ProjectQueryParams = {}) {
  const { page = 1, limit = 50, companyId, userId, isActive } = params;

  return useQuery({
    queryKey: ['projects', { page, limit, companyId, userId, isActive }],
    queryFn: () =>
      getProjects({
        page,
        limit,
        ...(companyId !== undefined ? { companyId } : {}),
        ...(userId !== undefined ? { userId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      }),
  });
}
