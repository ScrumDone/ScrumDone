import { useQuery } from '@tanstack/react-query';
import { getCompanyLogs } from '../api/companies';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

export function useCompanyLogs(companyId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['companies', companyId, 'logs', { page, limit }],
    queryFn: () =>
      withCompaniesApiLog('Historia współpracy (GET)', { companyId, page, limit }, () =>
        getCompanyLogs(companyId, page, limit),
      ),
    enabled: Boolean(companyId),
  });
}
