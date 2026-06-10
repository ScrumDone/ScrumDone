import { useQuery } from '@tanstack/react-query';
import { getCompanyLogs } from '../api/companies';

export function useCompanyLogs(companyId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['companies', companyId, 'logs', { page, limit }],
    queryFn: () => getCompanyLogs(companyId, page, limit),
    enabled: Boolean(companyId),
  });
}
