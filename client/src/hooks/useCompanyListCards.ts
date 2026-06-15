import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getCompanyContacts } from '../api/companies';
import type { ContactPerson } from '../types/contact';
import { useCompanies } from './useCompanies';
import { mapCompanyListItemToCard } from '../utils/companyDisplay';

export function useCompanyListCards(page = 1, limit = 100) {
  const { data, isLoading, isError, error } = useCompanies(page, limit);

  const companiesNeedingContacts = useMemo(
    () => (data?.items ?? []).filter((company) => !company.mainContact && company.contactPeopleCount > 0),
    [data?.items],
  );

  const contactQueries = useQueries({
    queries: companiesNeedingContacts.map((company) => ({
      queryKey: ['companies', company.id, 'contacts'],
      queryFn: () => getCompanyContacts(company.id),
      enabled: Boolean(company.id),
    })),
  });

  const contactsByCompanyId = useMemo(() => {
    const map = new Map<string, ContactPerson[]>();

    companiesNeedingContacts.forEach((company, index) => {
      const contacts = contactQueries[index]?.data?.items;
      if (contacts) {
        map.set(company.id, contacts);
      }
    });

    return map;
  }, [companiesNeedingContacts, contactQueries]);

  const companyCards = useMemo(
    () =>
      (data?.items ?? []).map((company) =>
        mapCompanyListItemToCard(company, contactsByCompanyId.get(company.id)),
      ),
    [data?.items, contactsByCompanyId],
  );

  return {
    companyCards,
    isLoading,
    isError,
    error,
  };
}
