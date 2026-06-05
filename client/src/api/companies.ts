import { apiGet } from './client';
import { apiPatch } from './client'; 
import { apiPost } from './client';
import type { PagedResult } from '../types/api';
import type { CompanyListItem } from '../types/company';
import type { CompanyUpdateDto } from '../types/company';
import type { ContactPerson, ContactPersonCreateDto } from '../types/contact';
import type { CompanyCreateDto, CompanyDetail } from '../types/company';


export function getCompanies(page = 1, limit = 10) {
    return apiGet<PagedResult<CompanyListItem>>('/api/companies', { page, limit });
  }

export function patchCompany(id: string, data: CompanyUpdateDto) {
    return apiPatch<CompanyListItem>(`/api/companies/${id}`, data);
}

export function getCompanyContacts(id: string) {
    return apiGet<PagedResult<ContactPerson>>(`/api/companies/${id}/contacts`);
}

export function addCompanyContact(id: string, data: ContactPersonCreateDto) {
    return apiPost<ContactPerson>(`/api/companies/${id}/contacts`, data);
}

export function createCompany(data: CompanyCreateDto) {
  return apiPost<CompanyDetail>('/api/companies', data);
}