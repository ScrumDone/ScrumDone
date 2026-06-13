import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompany } from '../api/companies';

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => deleteCompany(companyId),
    onSuccess: () => {
      // Inwalidujemy listę firm, aby po usunięciu widok był aktualny
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}