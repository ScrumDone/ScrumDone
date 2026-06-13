import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompanyContact } from '../api/companies';

export function useDeleteCompanyContact(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteCompanyContact(companyId, contactId),
    onSuccess: () => {
      // Inwalidujemy dane firmy, aby pobrać świeżą listę kontaktów po usunięciu
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
    },
  });
}