import { useQuery } from '@tanstack/react-query';
import { getCompanyLogs } from '../api/companies';

export function useCompanyLogs(id: string) {
  return useQuery({
    queryKey: ['companies', id, 'logs'],
    queryFn: () => getCompanyLogs(id),
    enabled: Boolean(id),
  });
}
