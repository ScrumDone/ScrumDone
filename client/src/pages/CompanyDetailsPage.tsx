import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import { MapPin, Mail, UserPlus, Edit, Phone, PlusIcon, MessageSquareText, UserRoundPen, FileSignature, MoreVertical } from 'lucide-react';
import { companies, type Company } from '../data/companies';
import { projects } from '../data/projects';
import CompanyEditModal, { type CompanyEditDraft } from '../components/CompanyEditModal';
import CompanyContactAddModal, { type CompanyContactDraft } from '../components/CompanyContactAddModal';

type CooperationHistoryItem = {
  id: string;
  title: string;
  tag: string;
  description: string;
  dateLabel: string;
  author: string;
  changeFrom?: string;
  changeTo?: string;
  Icon: React.ComponentType<{ className?: string }>;
};

type NoteItem = {
  id: string;
  author: string;
  avatarInitials: string;
  dateLabel: string;
  content: string;
};

const cooperationHistory: CooperationHistoryItem[] = [
  {
    id: 'history-1',
    title: 'Email sent',
    tag: 'Wysłano email',
    description: 'Wysłano email do Anny Wiśniewskiej z aktualizacją projektu.',
    dateLabel: '20 marca 2026',
    author: 'Artur Nowak',
    Icon: MessageSquareText,
  },
  {
    id: 'history-2',
    title: 'Contact person changed',
    tag: 'Zmiana osoby kontaktowej',
    description: 'Zmieniono osobę kontaktową na Annę Wiśniewską.',
    dateLabel: '15 stycznia 2026',
    author: 'Artur Nowak',
    changeFrom: 'Piotr Kowalski',
    changeTo: 'Anna Wiśniewska',
    Icon: UserRoundPen,
  },
  {
    id: 'history-3',
    title: 'Contract signed',
    tag: 'Podpis umowy',
    description: 'Podpisano umowę z Adoddle na rozwój aplikacji do zarządzania projektami.',
    dateLabel: '10 stycznia 2026',
    author: 'Artur Nowak',
    Icon: FileSignature,
  },
];

const initialNotes: NoteItem[] = [
  {
    id: 'note-1',
    author: 'Artur Nowak',
    avatarInitials: 'AN',
    dateLabel: '10 kwietnia 2026 16:45',
    content: 'Anna Wiśniewska wspomniała o możliwości polecenia naszych usług innym firmom z branży.',
  },
  {
    id: 'note-2',
    author: 'Eryk Baczyński',
    avatarInitials: 'EB',
    dateLabel: '02 kwietnia 2026 09:15',
    content: 'Spotkanie w przyszły wtorek o 10:00 - omówienie dalszych planów rozwoju aplikacji.',
  },
  {
    id: 'note-3',
    author: 'Artur Nowak',
    avatarInitials: 'AN',
    dateLabel: '15 marca 2026 14:30',
    content: 'Klient bardzo zadowolony z postępów projektu. Planuje rozszerzenie współpracy o kolejne moduły.',
  },
];

const CompanyDetailsPage: React.FC = () => {
  const { companySlug } = useParams();
  const company = companies.find((item) => item.slug === companySlug);
  const [displayedCompany, setDisplayedCompany] = useState<Company | null>(company ?? null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactAddModalOpen, setIsContactAddModalOpen] = useState(false);
  const [draft, setDraft] = useState<CompanyEditDraft>({
    name: company?.name ?? '',
    nip: company?.nip ?? '',
    krs: company?.companyNumber ?? '',
    regon: company?.regon ?? '',
    address: company?.address ?? '',
  });
  const [contactDraft, setContactDraft] = useState<CompanyContactDraft>({
    name: '',
    role: '',
    email: '',
    phone: '',
    isMainContact: false,
  });
  const mainContact = displayedCompany?.contacts[0];
  const activeProjects = displayedCompany ? projects.filter((project) => project.clientName === displayedCompany.name) : [];
  const [activeTab, setActiveTab] = useState<'projects' | 'history' | 'notes'>('projects');

  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    setDisplayedCompany(company ?? null);
    setDraft({
      name: company?.name ?? '',
      nip: company?.nip ?? '',
      krs: company?.companyNumber ?? '',
      regon: company?.regon ?? '',
      address: company?.address ?? '',
    });
    setContactDraft({
      name: '',
      role: '',
      email: '',
      phone: '',
      isMainContact: false,
    });
    setIsEditModalOpen(false);
    setIsContactAddModalOpen(false);
  }, [company]);

  if (!displayedCompany) {
    return (
      <div className="min-h-screen w-full bg-[#F9FAFB]">
        <SideBar />
        <TopBar />

        <main className="ml-64 pt-(--app-header-h)">
          <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
            Nie znaleziono firmy o podanym adresie.
          </section>
        </main>
      </div>
    );
  }

  const openEditModal = () => {
    setDraft({
      name: displayedCompany.name,
      nip: displayedCompany.nip,
      krs: displayedCompany.companyNumber,
      regon: displayedCompany.regon,
      address: displayedCompany.address,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const openContactAddModal = () => {
    setContactDraft({
      name: '',
      role: '',
      email: '',
      phone: '',
      isMainContact: false,
    });
    setIsContactAddModalOpen(true);
  };

  const closeContactAddModal = () => {
    setIsContactAddModalOpen(false);
  };

  const saveCompanyChanges = () => {
    setDisplayedCompany((prev) =>
      prev
        ? {
            ...prev,
            name: draft.name,
            nip: draft.nip,
            companyNumber: draft.krs,
            regon: draft.regon,
            address: draft.address,
          }
        : prev,
    );
    setIsEditModalOpen(false);
  };

  const saveContactChanges = () => {
    setIsContactAddModalOpen(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const now = new Date();
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      author: 'Artur Nowak',
      avatarInitials: 'AN',
      dateLabel: formattedDate,
      content: newNoteText.trim(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          <>
            <div className="mx-8 mt-6">
              <button className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium" onClick={() => window.history.back()}>
                <span>← Powrót do firm</span>
              </button>
            </div>

            <div className="mx-8 mt-6 rounded-[14px] border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between pb-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 mr-1 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-2xl font-bold text-blue-600">
                      {displayedCompany.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-medium leading-8 text-gray-900">{displayedCompany.name}</h1>
                    <div className="mt-3 grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-regular leading-4 text-gray-500 uppercase">NIP</p>
                        <p className="text-sm font-medium leading-5 text-gray-900">{displayedCompany.nip}</p>
                      </div>
                      <div>
                        <p className="text-xs font-regular leading-4 text-gray-500 uppercase">REGON</p>
                        <p className="text-sm font-medium leading-5 text-gray-900">{displayedCompany.regon}</p>
                      </div>
                      <div>
                        <p className="text-xs font-regular leading-4 text-gray-500 uppercase">Numer firmy</p>
                        <p className="text-sm font-medium leading-5 text-gray-900">{displayedCompany.companyNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={openContactAddModal}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <UserPlus className="w-4 h-4 text-gray-600" />
                    <span>Dodaj kontakt</span>
                  </button>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span>Edytuj</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h3 className="font-regular text-sm leading-5 text-gray-700">Adres</h3>
                  </div>
                  <p className="text-sm text-gray-800">{displayedCompany.address}</p>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <h3 className="font-regular text-sm leading-5  text-gray-700">Adresy email</h3>
                  </div>
                  <div className="space-y-1">
                    {displayedCompany.emails.map((email, index) => (
                      <p key={index} className="text-sm text-gray-800">
                        {email}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Osoby kontaktowe</h3>
                <div className="space-y-3">
                  {displayedCompany.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between bg-[#F9FAFB] border border-gray-200 rounded-[10px] p-4"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{contact.name}</h4>
                          {mainContact && contact.id === mainContact.id && (
                            <span className="rounded-full bg-scrumdone-blue-main px-2 py-1 text-xs font-medium text-white">
                              Główny kontakt
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{contact.role}</p>
                        <div className="mt-3 mx-auto flex max-w-180 items-center justify-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{contact.email}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between p-6 items-center">
              <div className="relative inline-grid h-9 w-fit grid-cols-3 rounded-[14px] bg-[#E5E7EB] p-0.75 ml-3">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0.75 bottom-0.75 rounded-[14px] bg-[#F8FAFC]  transition-all duration-300 ease-out"
                  style={{
                    width: 'calc((100% - 6px) / 3)',
                    left: activeTab === 'projects'
                      ? '3px'
                      : activeTab === 'history'
                        ? 'calc(3px + ((100% - 6px) / 3))'
                        : 'calc(3px + 2 * ((100% - 6px) / 3))',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setActiveTab('projects')}
                  className={`relative z-10 rounded-[14px] px-3 text-sm font-medium transition-colors ${activeTab === 'projects' ? 'text-[#0F172A]' : 'text-[#111827] hover:text-[#0F172A]'}`}
                >
                  Aktywne projekty (1)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`relative z-10 rounded-[14px] px-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-[#0F172A]' : 'text-[#111827] hover:text-[#0F172A]'}`}
                >
                  Historia współpracy (3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`relative z-10 rounded-[14px] px-3 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-[#0F172A]' : 'text-[#111827] hover:text-[#0F172A]'}`}
                >
                  Notatki ({notes.length})
                </button>
              </div>
              
              <button className="h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] text-white rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium leading-2.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap mr-3">
                  <PlusIcon className="w-4 h-4 stroke-2" />
                  Podepnij projekt
              </button>
            </div>

            {activeTab === 'projects' && (
              <section className="mx-8 mb-8 border border-gray-200 rounded-[14px] overflow-hidden transition-shadow duration-200 hover:shadow-md">
                <div className="space-y-6">
                  {activeProjects.length > 0 ? (
                    activeProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.slug}`}
                        className="w-full bg-white p-6 rounded-[14px] border border-gray-100 flex flex-col gap-2 hover:shadow-lg transition-shadow duration-300"
                      >
                        {/* NAZWA I STATUS */}
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-xl text-gray-900 font-medium">{project.name}</h3>
                          </div>
                          <span className="inline-flex items-center justify-center bg-scrumdone-blue-main text-white text-[12px] leading-4 font-medium px-2 py-0.5 rounded-lg whitespace-nowrap w-fit">
                            {project.status}
                          </span>
                        </div>

                        {/* OPIS */}
                        <p className="text-sm text-gray-700 leading-relaxed min-h-0">
                          {project.description}
                        </p>

                        {/* SZCZEGÓŁY W JEDNEJ LINII Z KROPKĄ */}
                        <div className="flex items-center gap-2 text-gray-700 text-sm mt-1">
                          <span>{project.startDate} - {project.endDate}</span>
                          <span className="text-gray-400">•</span>
                          <span>{project.membersCount} członków</span>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Postęp</span>
                            <span className="text-gray-700">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div 
                              className="bg-black h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      Brak aktywnych projektów powiązanych z tą firmą.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'history' && (
              <section
                className="mx-8 mb-8 rounded-[14px] border border-gray-200 bg-white p-6"
                style={{
                  ['--history-col-width' as string]: '56px',
                  ['--history-icon-size' as string]: '40px',
                } as React.CSSProperties}
              >
                <div className="space-y-8">
                  {cooperationHistory.map((item, index) => (
                    <article key={item.id} className="relative grid grid-cols-[var(--history-col-width)_minmax(0,1fr)] gap-4 lg:grid-cols-[var(--history-col-width)_minmax(0,1fr)_auto] lg:items-start">
                      {index < cooperationHistory.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[calc(var(--history-col-width)/2)] top-[calc(var(--history-icon shadow-md)/2)] h-[calc(100%+1.5rem)] w-px -translate-x-1/2 bg-slate-200"
                        />
                      )}

                      <div className="relative z-10 mx-auto flex h-[var(--history-icon-size)] w-[var(--history-icon-size)] items-center justify-center rounded-full border-2 border-scrumdone-blue-main bg-scrumdone-blue-200/40 text-scrumdone-blue-main">
                        <item.Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[16px] leading-6 font-medium text-slate-900 antialiased">{item.title}</h3>
                        <span className="mt-2 inline-flex rounded-lg border text-[12px] font-medium border-scrumdone-blue-main px-1 py-0.5 text-scrumdone-blue-main">
                          {item.tag}
                        </span>

                        <p className="mt-4 font-segoe-ui text-[14px] leading-6 text-slate-600 antialiased">{item.description}</p>

                        {item.changeFrom && item.changeTo && (
                          <p className="mt-2 font-segoe-ui text-[14px] leading-6 text-slate-700 antialiased">
                            <span className="line-through text-slate-500">{item.changeFrom}</span>
                            <span className="px-2">→</span>
                            <span className="font-medium text-slate-900">{item.changeTo}</span>
                          </p>
                        )}

                        <p className="mt-2 font-segoe-ui text-[12px] leading-5 text-slate-500 antialiased">Dodane przez: {item.author}</p>
                      </div>

                      <p className="font-segoe-ui text-[14px] leading-6 text-slate-500 antialiased lg:text-right">{item.dateLabel}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'notes' && (
              <section className="mx-8 mb-8 rounded-[14px] border border-gray-200 bg-white p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm text-gray-900 mb-3">Dodaj nową notatkę</h3>
                  <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Wpisz treść notatki..."
                      className="w-full min-h-[88px] rounded-xl bg-[#F9FAFB] p-3 text-sm text-gray-900 placeholder-gray-500 border-none resize-none focus:outline-none focus:ring-1 focus:ring-scrumdone-blue-main transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="self-start h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] disabled:opacity-50 disabled:hover:bg-scrumdone-blue-main text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium leading-2.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <PlusIcon className="w-4 h-4 stroke-2" />
                      <span>Dodaj notatkę</span>
                    </button>
                  </form>
                </div>

                <div className="flex flex-col gap-4">
                  {notes.map((note) => (
                    <article key={note.id} className="rounded-xl bg-[#F9FAFB] border border-gray-200 p-4 flex flex-col gap-3 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00C2FF] text-white text-xs font-bold">
                            {note.avatarInitials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900 leading-none">{note.author}</span>
                            <span className="text-xs font-normal text-gray-500 mt-1.5 leading-none">{note.dateLabel}</span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md">
                          <MoreVertical className="w-5 h-5 stroke-[1.5]" />
                        </button>
                      </div>
                      <p className="text-sm font-normal leading-6 text-[#1F2937] antialiased">
                        {note.content}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        </div>
      </main>

      <CompanyEditModal
        isOpen={isEditModalOpen}
        draft={draft}
        onClose={closeEditModal}
        onSave={saveCompanyChanges}
        onDraftChange={setDraft}
      />

      <CompanyContactAddModal
        isOpen={isContactAddModalOpen}
        draft={contactDraft}
        onClose={closeContactAddModal}
        onSave={saveContactChanges}
        onDraftChange={setContactDraft}
      />
    </div>
  );
};

export default CompanyDetailsPage;