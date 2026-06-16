import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCompanyLog } from '../api/companies';
import type { CooperationLogUpdateDto } from '../types/company';
import { withCompaniesApiLog } from '../utils/companiesApiDebug';

type UpdateCompanyLogInput = {
  companyId: string;
  logId: string;
  data: CooperationLogUpdateDto;
};

export function useUpdateCompanyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, logId, data }: UpdateCompanyLogInput) =>
      withCompaniesApiLog('Edytuj wpis historii (PATCH)', { companyId, logId, data }, () =>
        updateCompanyLog(companyId, logId, data),
      ),
    onSuccess: (_log, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'logs'] });
    },
  });
}
