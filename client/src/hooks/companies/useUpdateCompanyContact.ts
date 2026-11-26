import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCompanyContact } from '../../api/companies';
import type { ContactPersonUpdateDto } from '../../types/contact';
import { withCompaniesApiLog } from '../../utils/companiesApiDebug';

type UpdateCompanyContactInput = {
  companyId: string;
  contactId: string;
  data: ContactPersonUpdateDto;
};

export function useUpdateCompanyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, contactId, data }: UpdateCompanyContactInput) =>
      withCompaniesApiLog('Edytuj kontakt (PATCH)', { companyId, contactId, data }, () =>
        updateCompanyContact(companyId, contactId, data),
      ),
    onSuccess: () => {
      // Prefiks ['companies'] obejmuje listę firm, szczegóły firmy i listy kontaktów.
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
