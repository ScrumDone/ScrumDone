import type { ContactPerson } from './contact';

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