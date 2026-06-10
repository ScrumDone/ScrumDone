import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/users';

export function useUsers(page = 1, limit = 100) {
  return useQuery({
    queryKey: ['users', { page, limit }],
    queryFn: () => getUsers({ page, limit }),
  });
}
