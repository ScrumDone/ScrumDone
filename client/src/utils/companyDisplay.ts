import type { CompanyListItem } from '../types/company';
import type { ContactPerson } from '../types/contact';

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

export function resolveMainContact(contacts: ContactPerson[]): ContactPerson | null {
  return contacts.find((contact) => contact.isPrimary) ?? contacts[0] ?? null;
}

export function mapCompanyListItemToCard(
  company: CompanyListItem,
  contacts?: ContactPerson[],
): CompanyCardDisplay {
  const main = company.mainContact ?? (contacts ? resolveMainContact(contacts) : null);

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
