import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCompanyLog } from '../api/companies';
import type { CooperationLogCreateDto } from '../types/log';

type AddCompanyLogInput = {
  companyId: string;
  data: CooperationLogCreateDto;
};

export function useAddCompanyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: AddCompanyLogInput) =>
      addCompanyLog(companyId, data),
    onSuccess: (_log, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'logs'] });
    },
  });
}
