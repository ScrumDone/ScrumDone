export interface ContactPerson {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  nip: string;
  regon: string;
  companyNumber: string;
  address: string;
  emails: string[];
  phone: string;
  projectsCount: number;
  mainContactName: string;
  mainContactRole: string;
  contactsCount: number;
  contacts: ContactPerson[];
}

export const companies: Company[] = [
  {
    id: 1,
    name: "Adoddle",
    slug: "adoddle",
    nip: "1234567890",
    regon: "0000123456",
    companyNumber: "123456789",
    address: "ul. Kwiatowa 10, 00-001 Warszawa",
    emails: [
      "kontakt@adoddle.com",
      "biuro@adoddle.com",
      "projekty@adoddle.com",
    ],
    phone: "+48 123 456 789",
    projectsCount: 1,
    mainContactName: "Anna Wiśniewska",
    mainContactRole: "CEO",
    contactsCount: 3,
    contacts: [
      {
        id: 1,
        name: "Anna Wiśniewska",
        role: "CEO",
        email: "anna.wisniewska@adoddle.com",
        phone: "+48 123 456 789",
      },
      {
        id: 2,
        name: "Marek Nowak",
        role: "CTO",
        email: "marek.nowak@adoddle.com",
        phone: "+48 123 456 790",
      },
      {
        id: 3,
        name: "Joanna Kowalska",
        role: "Project Manager",
        email: "joanna.kowalska@adoddle.com",
        phone: "+48 123 456 791",
      },
    ],
  },
  {
    id: 2,
    name: "Nexus Tech",
    slug: "nexus-tech",
    nip: "0987654321",
    regon: "1111223344",
    companyNumber: "987654321",
    address: "ul. Technologiczna 5, 02-003 Warszawa",
    emails: ["piotr.zielinski@nexus.com", "info@nexus.com"],
    phone: "+48 987 654 321",
    projectsCount: 1,
    mainContactName: "Piotr Zielinski",
    mainContactRole: "Prezes Zarządu",
    contactsCount: 2,
    contacts: [
      {
        id: 4,
        name: "Piotr Zielinski",
        role: "Prezes Zarządu",
        email: "piotr.zielinski@nexus.com",
        phone: "+48 987 654 321",
      },
      {
        id: 5,
        name: "Marta Lewandowska",
        role: "Kierownik Projektów",
        email: "marta.lewandowska@nexus.com",
        phone: "+48 987 654 322",
      },
    ],
  },
  {
    id: 3,
    name: "Hadar Solutions",
    slug: "hadar-solutions",
    nip: "1122334455",
    regon: "2222334455",
    companyNumber: "112233445",
    address: "ul. Rozwiązań 15, 30-001 Kraków",
    emails: ["katarzyna.lewandowska@hadar.com", "kontakt@hadar.com"],
    phone: "+48 555 666 777",
    projectsCount: 1,
    mainContactName: "Katarzyna Lewandowska",
    mainContactRole: "Dyrektorka Generalna",
    contactsCount: 3,
    contacts: [
      {
        id: 6,
        name: "Katarzyna Lewandowska",
        role: "Dyrektorka Generalna",
        email: "katarzyna.lewandowska@hadar.com",
        phone: "+48 555 666 777",
      },
      {
        id: 7,
        name: "Tomasz Szymański",
        role: "Kierownik Sprzedaży",
        email: "tomasz.szymanski@hadar.com",
        phone: "+48 555 666 778",
      },
      {
        id: 8,
        name: "Barbara Nowak",
        role: "Specjalista ds. Projektów",
        email: "barbara.nowak@hadar.com",
        phone: "+48 555 666 779",
      },
    ],
  },
];
