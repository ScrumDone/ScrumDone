import { useQuery } from '@tanstack/react-query';
import { getCompanyContacts } from '../api/companies';

export function useCompanyContacts(id: string) {
  return useQuery({
    queryKey: ['companies', id, 'contacts'],
    queryFn: () => getCompanyContacts(id),
    enabled: Boolean(id),
  });
}
