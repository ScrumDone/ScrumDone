import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCompanyNote } from '../api/companies';
import type { CompanyNoteUpdateDto } from '../types/company';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

export function useUpdateCompanyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      noteId,
      data,
    }: {
      companyId: string;
      noteId: string;
      data: CompanyNoteUpdateDto;
    }) =>
      withCompaniesApiLog('Edytuj notatkę (PATCH)', { companyId, noteId, data }, () =>
        updateCompanyNote(companyId, noteId, data),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'notes'] });
    },
  });
}
