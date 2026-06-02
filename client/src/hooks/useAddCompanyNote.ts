import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompanyNote } from '../api/companies';
import type { CompanyNoteCreateDto } from '../types/company'; 

export function useAddCompanyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CompanyNoteCreateDto }) =>
      createCompanyNote(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'notes'] });
    },
  });
}