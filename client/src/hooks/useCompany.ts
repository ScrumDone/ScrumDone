import { useQuery } from '@tanstack/react-query';
import { getCompanyDetails } from '../api/companies';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () =>
      withCompaniesApiLog('Szczegóły firmy (GET)', { id }, () => getCompanyDetails(id)),
    enabled: Boolean(id),
  });
}