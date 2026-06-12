import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompanyNote } from '../api/companies';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

export function useDeleteCompanyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, noteId }: { companyId: string; noteId: string }) =>
      withCompaniesApiLog('Usuń notatkę (DELETE)', { companyId, noteId }, () =>
        deleteCompanyNote(companyId, noteId),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'notes'] });
    },
  });
}
