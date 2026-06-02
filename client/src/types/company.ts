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

export type CompanyNote = {
  id: string;        
  companyId: string; 
  content: string;   
  createdAt: string; 
  updatedAt: string;
  author?: {
    firstName: string;
    lastName: string;
  };
};

export type CompanyNoteCreateDto = {
  content: string;   
};