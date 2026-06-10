import { useQuery } from '@tanstack/react-query';
import { getCompanyNotes } from '../api/companies';
import type { PagedResult } from '../types/api';
import type { CompanyNote } from '../types/company';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

export function useCompanyNotes(companyId: string, page = 1, limit = 10) {
  return useQuery<PagedResult<CompanyNote>>({
    queryKey: ['companies', companyId, 'notes', { page, limit }],
    queryFn: () =>
      withCompaniesApiLog('Lista notatek (GET)', { companyId, page, limit }, () =>
        getCompanyNotes(companyId, page, limit),
      ),
    enabled: !!companyId,
  });
}