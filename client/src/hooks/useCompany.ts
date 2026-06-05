import { useQuery } from '@tanstack/react-query';
import { getCompanyDetails } from '../api/companies';

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => getCompanyDetails(id),
    enabled: Boolean(id),
  });
}