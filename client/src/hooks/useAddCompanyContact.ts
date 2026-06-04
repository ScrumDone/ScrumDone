import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCompanyContact } from '../api/companies';
import type { ContactPersonCreateDto } from '../types/contact';

type AddCompanyContactInput = {
  companyId: string;
  data: ContactPersonCreateDto;
};

export function useAddCompanyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: AddCompanyContactInput) =>
      addCompanyContact(companyId, data),
    onSuccess: (_contact, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'contacts'] });
    },
  });
}