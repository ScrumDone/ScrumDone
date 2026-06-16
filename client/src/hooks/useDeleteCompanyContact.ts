import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompanyContact } from '../api/companies';

export function useDeleteCompanyContact(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteCompanyContact(companyId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}