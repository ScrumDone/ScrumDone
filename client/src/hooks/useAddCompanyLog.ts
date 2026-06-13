import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompanyLog } from '../api/companies';
import type { CooperationLogCreateDto } from '../types/company';

export function useAddCompanyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CooperationLogCreateDto }) =>
      createCompanyLog(companyId, data),
    onSuccess: (_, variables) => {
      // Inwalidacja logów, aby odświeżyć listę w widoku historii
      queryClient.invalidateQueries({ queryKey: ['companyLogs', variables.companyId] });
    },
  });
}