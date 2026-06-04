import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchCompany } from '../api/companies';
import type { CompanyUpdateDto } from '../types/company';

type UpdateCompanyInput = {
  id: string;
  data: CompanyUpdateDto;
};

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCompanyInput) => patchCompany(id, data),
    onSuccess: (_updatedCompany, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', id] });
    },
  });
}
