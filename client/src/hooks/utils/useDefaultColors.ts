import { useQuery } from '@tanstack/react-query';
import { getDefaultColors } from '../../api/utils';
import { ApiError } from '../../api/client';

export function useDefaultColors() {
  return useQuery<string[], ApiError>({
    queryKey: ['default-colors'],
    queryFn: () => getDefaultColors(),
    staleTime: 1000 * 60 * 60, // 1 godzina – paleta jest stała po stronie backendu
    gcTime: 1000 * 60 * 60,
  });
}
