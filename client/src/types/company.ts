import type { ContactPerson } from './contact';
import type { UserSummary } from './user';

export type { UserSummary };

export type CompanyListItem = {
  id: string;
  name: string;
  nip: string | null;
  createdAt: string;
  updatedAt: string;
  mainContact: ContactPerson | null;
  contactPeopleCount: number;
  projectsCount: number;
};

export type CompanyUpdateDto = {
  name: string | null;
  nip: string | null;
  krs: string | null;
  regon: string | null;
  address: string | null;
};

export type CompanyNote = {
  id: string;
  content: string;
  isEdited: boolean;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
};

export type CompanyNoteCreateDto = {
  content: string;
};

export type CompanyNoteUpdateDto = {
  content: string;
};

export type CompanyCreateDto = {
  name: string;                     
  nip: string | null;
  krs: string | null;
  regon: string | null;
  address: string | null;
};

// odpowiedz z backendu do getCompanyDetails rozniu sie od CompanyListItem
export type CompanyDetail = {
  id: string;
  name: string;
  nip: string | null;
  krs: string | null;
  regon: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  contactPeopleCount: number;
  projectCount: number;
  contacts: ContactPerson[];
};

export type CooperationLog = {
  id: string;
  title: string;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
};

export type CooperationLogCreateDto = {
  title: string;
  description: string | null;
  newValue: string | null;
  oldValue: string | null;
};