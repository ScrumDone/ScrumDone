import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import { companies } from '../data/companies';
import { projects } from '../data/projects';
import CompanyEditModal, { type CompanyEditDraft } from '../components/CompanyEditModal';
import CompanyContactAddModal, { type CompanyContactDraft } from '../components/CompanyContactAddModal';
import { useUpdateCompany } from '../hooks/useUpdateCompany';
import { useCompany } from '../hooks/useCompany';
import { useAddCompanyContact } from '../hooks/useAddCompanyContact';
import { useAddCompanyNote } from '../hooks/useAddCompanyNote';
import { useCompanyNotes } from '../hooks/useCompanyNotes';
import type { ContactPerson } from '../types/contact';

const isGuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const emptyDisplay = (value: string | null | undefined) => value?.trim() || '—';

const formatBackendDate = (date: string) =>
  new Date(date).toLocaleString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

type CompanyDisplay = {
  id: string;
  name: string;
  nip: string;
  regon: string;
  companyNumber: string;
  address: string;
  emails: string[];
  contacts: ContactPerson[];
  projectCount: number;
};

type NoteItem = {
  id: string;
  author: string;
  avatarInitials: string;
  dateLabel: string;
  content: string;
};

const CompanyDetailsPage: React.FC = () => {
  const { companySlug } = useParams();
  const companyId = companySlug ?? '';
  const isApiRoute = isGuid(companyId);

  const { data: apiCompany, isLoading, isError, error } = useCompany(
    isApiRoute ? companyId : undefined
  );

  const mockCompany = !isApiRoute
    ? companies.find((item) => item.slug === companySlug)
    : undefined;

  const displayedCompany: CompanyDisplay | null = apiCompany
    ? {
        id: apiCompany.id,
        name: apiCompany.name,
        nip: emptyDisplay(apiCompany.nip),
        regon: emptyDisplay(apiCompany.regon),
        companyNumber: emptyDisplay(apiCompany.krs),
        address: emptyDisplay(apiCompany.address),
        emails: [
          ...new Set(
            apiCompany.contacts
              .map((c) => c.email)
              .filter((e): e is string => Boolean(e?.trim()))
          ),
        ],
        contacts: apiCompany.contacts,
        projectCount: apiCompany.projectCount,
      }
    : mockCompany
    ? {
        id: String(mockCompany.id),
        name: mockCompany.name,
        nip: mockCompany.nip,
        regon: mockCompany.regon,
        companyNumber: mockCompany.companyNumber,
        address: mockCompany.address,
        emails: mockCompany.emails.filter(Boolean),
        contacts: mockCompany.contacts.map((c, i) => ({
          id: String(c.id),
          name: c.name,
          role: c.role,
          email: c.email,
          phone: c.phone,
          isPrimary: i === 0,
        })),
        projectCount: mockCompany.projectsCount,
      }
    : null;

  const [draft, setDraft] = useState<CompanyEditDraft>({
    name: '',
    nip: '',
    krs: '',
    regon: '',
    address: '',
  });

  const [contactDraft, setContactDraft] = useState<CompanyContactDraft>({
    name: '',
    role: '',
    email: '',
    phone: '',
    isMainContact: false,
  });

  const [activeTab, setActiveTab] =
    useState<'projects' | 'history' | 'notes'>('projects');

  const [newNoteText, setNewNoteText] = useState('');
  const [notes, setNotes] = useState<NoteItem[]>([]);

  const { mutate: updateCompany } = useUpdateCompany();
  const { mutate: addContact } = useAddCompanyContact();

  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
  } = useCompanyNotes(companyId);

  const {
    mutate: addNote,
    isPending: isAddingNote,
    isError: isAddNoteError,
    error: addNoteError,
  } = useAddCompanyNote();

  const apiNotes = Array.isArray(notesData?.items) ? notesData.items : [];
  const totalNotesCount = notesData?.totalCount ?? 0;

  // Ustawianie draftu po zmianie firmy
  useEffect(() => {
    if (!displayedCompany) return;

    setDraft({
      name: displayedCompany.name,
      nip: displayedCompany.nip === '—' ? '' : displayedCompany.nip,
      krs: displayedCompany.companyNumber === '—' ? '' : displayedCompany.companyNumber,
      regon: displayedCompany.regon === '—' ? '' : displayedCompany.regon,
      address: displayedCompany.address === '—' ? '' : displayedCompany.address,
    });
  }, [displayedCompany?.id]);

  // Scalanie notatek API + optymistycznych
  useEffect(() => {
    if (!notesData) return;

    setNotes((prev) => {
      const optimistic = prev.filter((n) => n.id.startsWith('temp-'));

      const backend = apiNotes.map((n) => ({
        id: n.id,
        author: n.author.name,
        avatarInitials: n.author.name
          ? n.author.name
              .split(' ')
              .map((x) => x[0])
              .join('')
              .toUpperCase()
          : '??',
        dateLabel: formatBackendDate(n.createdAt),
        content: n.content,
      }));

      return [...optimistic, ...backend];
    });
  }, [notesData]);

  if (isApiRoute && isLoading) return <div>Ładowanie...</div>;
  if (isApiRoute && isError) return <div>Błąd: {error?.message ?? 'Nieznany błąd'}</div>;
  if (!displayedCompany) return <div>Nie znaleziono firmy</div>;

  const activeProjects = projects.filter(
    (p) => p.clientId === displayedCompany.id
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || isAddingNote) return;

    const content = newNoteText.trim();

    const optimistic: NoteItem = {
      id: `temp-${crypto.randomUUID()}`,
      author: 'Ty',
      avatarInitials: 'TY',
      dateLabel: new Date().toLocaleString('pl-PL'),
      content,
    };

    setNotes((prev) => [optimistic, ...prev]);
    setNewNoteText('');

    addNote(
      { companyId, data: { content } },
      {
        onSuccess: (res: any) => {
          setNotes((prev) =>
            prev.map((n) =>
              n.id === optimistic.id
                ? { ...n, id: res?.id ?? n.id }
                : n
            )
          );
        },
        onError: () => {
          setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="mx-8 mt-6 bg-white p-6 rounded-lg border">

          <h1 className="text-2xl font-semibold">{displayedCompany.name}</h1>

          <div className="flex gap-4 mt-6">
            <button onClick={() => setActiveTab('projects')}>Projekty</button>
            <button onClick={() => setActiveTab('history')}>Historia</button>
            <button onClick={() => setActiveTab('notes')}>
              Notatki ({totalNotesCount})
            </button>
          </div>

          {activeTab === 'notes' && (
            <div className="mt-6">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <textarea
                  className="border p-2 flex-1"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Dodaj notatkę..."
                />
                <button type="submit" disabled={isAddingNote}>
                  Dodaj
                </button>
              </form>

              {isAddNoteError && (
                <p className="text-red-500">
                  {addNoteError?.message || 'Błąd dodawania'}
                </p>
              )}

              {isNotesError && (
                <p className="text-red-500 mt-2">Błąd pobierania notatek</p>
              )}

              <div className="mt-4 space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="border p-3 rounded">
                    <div className="text-sm text-gray-500">{n.dateLabel}</div>
                    <div className="font-semibold">{n.author}</div>
                    <div>{n.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CompanyDetailsPage;
