import { apiGet } from './client';
import type { PagedResult } from '../types/api';
import type { CompanyListItem } from '../types/company';


export function getCompanies(page = 1, limit = 10) {
    return apiGet<PagedResult<CompanyListItem>>('/api/companies', { page, limit });
  }