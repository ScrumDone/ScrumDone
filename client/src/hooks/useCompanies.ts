import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '../api/companies';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

export function useCompanies(page = 1, limit = 10) {
    return useQuery({
        queryKey: ['companies', { page, limit }],
        queryFn: () =>
          withCompaniesApiLog('Lista firm (GET)', { page, limit }, () => getCompanies(page, limit)),
    });
}