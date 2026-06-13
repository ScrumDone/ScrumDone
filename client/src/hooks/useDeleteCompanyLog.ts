import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompanyLog } from '../api/companies';

export function useDeleteCompanyLog(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => deleteCompanyLog(companyId, logId),
    onSuccess: () => {
      // Inwalidujemy cache logów, aby odświeżyć widok po usunięciu
      queryClient.invalidateQueries({ queryKey: ['companyLogs', companyId] });
    },
  });
}