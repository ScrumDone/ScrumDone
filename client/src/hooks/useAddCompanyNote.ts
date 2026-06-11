import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompanyNote } from '../api/companies';
import type { CompanyNoteCreateDto } from '../types/company';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

export function useAddCompanyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CompanyNoteCreateDto }) =>
      withCompaniesApiLog('Dodaj notatkę (POST)', { companyId, data }, () =>
        createCompanyNote(companyId, data),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'notes'] });
    },
  });
}