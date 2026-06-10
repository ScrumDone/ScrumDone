import type { CompanyListItem } from '../types/company';

export type CompanyCardDisplay = {
  id: string;
  name: string;
  nip: string;
  email: string;
  phone: string;
  projectsCount: number;
  mainContactName: string;
  mainContactRole: string;
  contactsCount: number;
};

const emptyDisplay = (value: string | null | undefined, fallback = '—') =>
  value?.trim() || fallback;

export function mapCompanyListItemToCard(company: CompanyListItem): CompanyCardDisplay {
  const main = company.mainContact;

  return {
    id: company.id,
    name: company.name,
    nip: emptyDisplay(company.nip),
    email: emptyDisplay(main?.email),
    phone: emptyDisplay(main?.phone),
    projectsCount: company.projectsCount,
    mainContactName: emptyDisplay(main?.name, 'Brak kontaktu'),
    mainContactRole: emptyDisplay(main?.role),
    contactsCount: company.contactPeopleCount,
  };
}
