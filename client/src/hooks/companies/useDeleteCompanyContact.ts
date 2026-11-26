import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompanyContact } from '../../api/companies';

export function useDeleteCompanyContact(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteCompanyContact(companyId, contactId),
    onSuccess: () => {
      // Prefiks ['companies'] obejmuje listę firm, szczegóły firmy i listy kontaktów.
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}