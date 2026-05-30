import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '../api/companies';


export function useCompanies(page = 1, limit = 10) {
    return useQuery({
        queryKey:['comapnies', {page, limit}],
        queryFn: () => getCompanies(page, limit),
    });
}