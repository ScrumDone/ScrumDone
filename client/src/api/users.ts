import { apiGet } from './client';
import type { PagedResult } from '../types/api';
import type { UserQueryParams, UserSummary } from '../types/user';

export function getUsers(params: UserQueryParams = {}) {
  const { page = 1, limit = 10 } = params;
  return apiGet<PagedResult<UserSummary>>('/api/users', { page, limit });
}
