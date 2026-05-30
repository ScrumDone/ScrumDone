import type { ContactPerson } from './contact';

export type CompanyListItem = {
  id: string;
  name: string;
  nip: string | null;
  createdAt: string;
  updatedAt: string;
  mainContact: ContactPerson;
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