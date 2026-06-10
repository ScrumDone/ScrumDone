import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompany } from '../api/companies';
import type { CompanyCreateDto } from '../types/company';

type CreateCompanyInput = {
  data: CompanyCreateDto;
};

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: CreateCompanyInput) => createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}