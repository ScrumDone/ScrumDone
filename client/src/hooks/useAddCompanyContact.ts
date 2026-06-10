import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCompanyContact } from '../api/companies';
import type { ContactPersonCreateDto } from '../types/contact';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

type AddCompanyContactInput = {
  companyId: string;
  data: ContactPersonCreateDto;
};

export function useAddCompanyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: AddCompanyContactInput) =>
      withCompaniesApiLog('Dodaj kontakt (POST)', { companyId, data }, () =>
        addCompanyContact(companyId, data),
      ),
    onSuccess: (_contact, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
    },
  });
}