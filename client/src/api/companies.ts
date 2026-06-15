import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type { PagedResult } from '../types/api';
import type { CompanyListItem, CooperationLogCreateDto } from '../types/company';
import type { CompanyUpdateDto } from '../types/company';
import type { ContactPerson, ContactPersonCreateDto, ContactPersonUpdateDto } from '../types/contact';
import type { CompanyNote, CompanyNoteCreateDto, CompanyNoteUpdateDto } from '../types/company';
import type { CompanyCreateDto, CompanyDetail, CooperationLog, CooperationLogUpdateDto } from '../types/company';


export function getCompanies(page = 1, limit = 10) {
    return apiGet<PagedResult<CompanyListItem>>('/api/companies', { page, limit });
  }

export function getCompanyDetails(id: string) {
    return apiGet<CompanyDetail>(`/api/companies/${id}`);
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

export function updateCompanyContact(companyId: string, contactId: string, data: ContactPersonUpdateDto) {
  return apiPatch<ContactPerson>(`/api/companies/${companyId}/contacts/${contactId}`, data);
}

export function createCompanyNote(companyId: string, data: CompanyNoteCreateDto) {
  return apiPost<CompanyNote>(`/api/companies/${companyId}/notes`, data);
}

export function getCompanyNotes(companyId: string, page = 1, limit = 10) {
  return apiGet<PagedResult<CompanyNote>>(`/api/companies/${companyId}/notes`, { page, limit });
}

export function updateCompanyNote(companyId: string, noteId: string, data: CompanyNoteUpdateDto) {
  return apiPatch<CompanyNote>(`/api/companies/${companyId}/notes/${noteId}`, data);
}

export function deleteCompanyNote(companyId: string, noteId: string) {
  return apiDelete(`/api/companies/${companyId}/notes/${noteId}`);
}
  
export function createCompany(data: CompanyCreateDto) {
  return apiPost<CompanyDetail>('/api/companies', data);
}

export function getCompanyLogs(companyId: string, page = 1, limit = 50) {
  return apiGet<PagedResult<CooperationLog>>(`/api/companies/${companyId}/logs`, { page, limit });
}

export function deleteCompanyLog(companyId: string, logId: string) {
  return apiDelete(`/api/companies/${companyId}/logs/${logId}`);
}

export function updateCompanyLog(companyId: string, logId: string, data: CooperationLogUpdateDto) {
  return apiPatch<CooperationLog>(`/api/companies/${companyId}/logs/${logId}`, data);
}

export function deleteCompany(id: string) {
  return apiDelete(`/api/companies/${id}`);
}

export function createCompanyLog(companyId: string, data: CooperationLogCreateDto) {
  return apiPost<CooperationLog>(`/api/companies/${companyId}/logs`, data);
}

export function deleteCompanyContact(companyId: string, contactId: string) {
  return apiDelete(`/api/companies/${companyId}/contacts/${contactId}`);
}