import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import { MapPin, Mail, UserPlus, Edit, Phone, PlusIcon, MessageSquareText, UserRoundPen, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import CompanyEditModal, { type CompanyEditDraft } from '../components/CompanyEditModal';
import CompanyContactAddModal, { type CompanyContactDraft } from '../components/CompanyContactAddModal';
import CompanyAttachProjectModal from '../components/CompanyAttachProjectModal';
import CompanyProjectListItem from '../components/CompanyProjectListItem';
import { useUpdateCompany } from '../hooks/useUpdateCompany';
import { useCompany } from '../hooks/useCompany';
import { useProjects } from '../hooks/useProjects';
import { useUpdateProject } from '../hooks/useUpdateProject';
import { useAddCompanyContact } from '../hooks/useAddCompanyContact';
import { useAddCompanyNote } from '../hooks/useAddCompanyNote';
import { useCompanyNotes } from '../hooks/useCompanyNotes';
import { useUpdateCompanyNote } from '../hooks/useUpdateCompanyNote';
import { useDeleteCompanyNote } from '../hooks/useDeleteCompanyNote';
import { useCompanyLogs } from '../hooks/useCompanyLogs';
import type { ContactPerson } from '../types/contact';
import type { CompanyNote, CooperationLog, CooperationLogCreateDto } from '../types/company';
import {useDeleteCompanyLog} from '../hooks/useDeleteCompanyLog';
import { useDeleteCompany } from '../hooks/useDeleteCompany';
import {useAddCompanyLog} from '../hooks/useAddCompanyLog';
import {useDeleteCompanyContact} from '../hooks/useDeleteCompanyContact';
import { mapProjectListItemToCard } from '../utils/projectDisplay';

//TODO: Log jest usuwany, ale zmiana nie nastepuje od razu na froncie

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

const toNoteItem = (note: CompanyNote): NoteItem => {
  const authorName = note.author?.name?.trim() || 'Nieznany autor';
  const nameParts = authorName.split(' ').filter(Boolean);

  return {
    id: note.id,
    author: authorName,
    avatarInitials: nameParts.map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2) || '??',
    dateLabel: formatBackendDate(note.createdAt),
    content: note.content,
  };
};

const isOptimisticNoteId = (id: string) => id.startsWith('note-');

const mapCooperationLogToHistoryItem = (log: CooperationLog): CooperationHistoryItem => {
  const changeFrom = log.oldValue?.trim();
  const changeTo = log.newValue?.trim();

  return {
    id: log.id,
    title: log.title,
    tag: log.title,
    description: log.description?.trim() || '—',
    dateLabel: formatBackendDate(log.createdAt),
    author: log.author?.name?.trim() || 'Nieznany autor',
    ...(changeFrom && changeTo ? { changeFrom, changeTo } : {}),
    Icon: changeFrom && changeTo ? UserRoundPen : MessageSquareText,
  };
};

const CompanyDetailsPage: React.FC = () => {
  const { companyId = '' } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deleteCompany } = useDeleteCompany();
  const { mutate: deleteLog } = useDeleteCompanyLog(companyId);
  const { mutate: addLog } = useAddCompanyLog();
  const { mutate: deleteContact } = useDeleteCompanyContact(companyId);

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę osobę kontaktową?')) {
      deleteContact(contactId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
        }
      });
    }
  };

  const handleAddLog = (data: CooperationLogCreateDto) => {
    addLog({ companyId, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'logs'] });
      }
    });
  };

  const handleDeleteLog = (logId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten wpis z historii?')) {
      deleteLog(logId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'logs'] });
        }
      });
    }
  };

  const handleDeleteCompany = () => {
    if (companyId) {
      deleteCompany(companyId, {
        onSuccess: () => {
          navigate('/companies'); // Przekierowanie po sukcesie
        }
      });
    }
  };

  const { data: apiCompany, isLoading, isError, error } = useCompany(companyId);

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
              .map((contact) => contact.email)
              .filter((email): email is string => Boolean(email?.trim())),
          ),
        ],
        contacts: apiCompany.contacts,
        projectCount: apiCompany.projectCount,
      }
    : null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactAddModalOpen, setIsContactAddModalOpen] = useState(false);
  const [isAttachProjectModalOpen, setIsAttachProjectModalOpen] = useState(false);
  const [selectedAttachProjectId, setSelectedAttachProjectId] = useState<string | null>(null);
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

  const [activeTab, setActiveTab] = useState<'projects' | 'history' | 'notes'>('projects');

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [openNoteMenuId, setOpenNoteMenuId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const noteMenuRef = useRef<HTMLDivElement>(null);
  const { mutate: updateCompany, isPending: isSavingCompany, isError: isUpdateCompanyError, error: updateCompanyError, reset: resetUpdateCompany } = useUpdateCompany();
  const {
    mutate: addContact,
    isPending: isAddingContact,
    isError: isAddContactError,
    error: addContactError,
    reset: resetAddContact,
  } = useAddCompanyContact();
  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
  } = useCompanyNotes(companyId);
  const {
    data: logsData,
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useCompanyLogs(companyId);
  const {
    mutate: createNote,
    isPending: isAddingNote,
    isError: isAddNoteError,
    error: addNoteError,
  } = useAddCompanyNote();
  const { mutate: updateNote, isPending: isUpdatingNote } = useUpdateCompanyNote();
  const { mutate: deleteNote, isPending: isDeletingNote } = useDeleteCompanyNote();
  const {
    mutate: attachProject,
    isPending: isAttachingProject,
    isError: isAttachProjectError,
    error: attachProjectError,
    reset: resetAttachProject,
  } = useUpdateProject();
  const {
    data: attachProjectsData,
    isLoading: isAttachProjectsLoading,
  } = useProjects({ page: 1, limit: 100 }, { enabled: isAttachProjectModalOpen });
  const {
    data: companyProjectsData,
    isLoading: isCompanyProjectsLoading,
    isError: isCompanyProjectsError,
    error: companyProjectsError,
  } = useProjects(
    { companyId, page: 1, limit: 100, isActive: true },
    { enabled: Boolean(companyId) },
  );

  const totalNotesCount = notesData?.totalCount ?? 0;
  const cooperationHistory = useMemo(
    () => (logsData?.items ?? []).map(mapCooperationLogToHistoryItem),
    [logsData?.items],
  );

  const availableAttachProjects = useMemo(() => {
    if (!displayedCompany) {
      return [];
    }

    return (attachProjectsData?.items ?? []).filter(
      (project) => project.companyId !== displayedCompany.id,
    );
  }, [attachProjectsData?.items, displayedCompany?.id]);

  const companyProjectCards = useMemo(
    () => (companyProjectsData?.items ?? []).map(mapProjectListItemToCard),
    [companyProjectsData?.items],
  );

  const companyProjectsCount = companyProjectsData?.totalCount ?? displayedCompany?.projectCount ?? 0;

  useEffect(() => {
    if (!displayedCompany) return;

    setDraft({
      name: displayedCompany.name,
      nip: displayedCompany.nip === '—' ? '' : displayedCompany.nip,
      krs: displayedCompany.companyNumber === '—' ? '' : displayedCompany.companyNumber,
      regon: displayedCompany.regon === '—' ? '' : displayedCompany.regon,
      address: displayedCompany.address === '—' ? '' : displayedCompany.address,
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
    setIsAttachProjectModalOpen(false);
    setSelectedAttachProjectId(null);
    setNotes([]);
  }, [displayedCompany?.id]);

  useEffect(() => {
    if (!notesData) return;

    const fetchedNotes = Array.isArray(notesData.items) ? notesData.items : [];

    setNotes((prev) => {
      const optimistic = prev.filter((note) => isOptimisticNoteId(note.id));
      return [...optimistic, ...fetchedNotes.map(toNoteItem)];
    });
  }, [notesData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (noteMenuRef.current && !noteMenuRef.current.contains(event.target as Node)) {
        setOpenNoteMenuId(null);
      }
    };

    if (openNoteMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openNoteMenuId]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F9FAFB]">
        <SideBar />
        <TopBar />
        <main className="ml-64 pt-(--app-header-h)">
          <section className="mx-8 mt-6 rounded-[14px] border border-gray-200 bg-white p-6 text-sm text-slate-500">
            Ładowanie...
          </section>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen w-full bg-[#F9FAFB]">
        <SideBar />
        <TopBar />
        <main className="ml-64 pt-(--app-header-h)">
          <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
            Błąd: {error.message}
          </section>
        </main>
      </div>
    );
  }

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

  const contactsToShow = displayedCompany.contacts;
  const mainContactId =
    contactsToShow.find((contact) => contact.isPrimary)?.id ?? contactsToShow[0]?.id;

  const openEditModal = () => {
    resetUpdateCompany();
    setDraft({
      name: displayedCompany.name,
      nip: displayedCompany.nip === '—' ? '' : displayedCompany.nip,
      krs: displayedCompany.companyNumber === '—' ? '' : displayedCompany.companyNumber,
      regon: displayedCompany.regon === '—' ? '' : displayedCompany.regon,
      address: displayedCompany.address === '—' ? '' : displayedCompany.address,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    resetUpdateCompany();
    setIsEditModalOpen(false);
  };

  const openContactAddModal = () => {
    resetAddContact();
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
    resetAddContact();
    setIsContactAddModalOpen(false);
  };

  const saveCompanyChanges = () => {
    updateCompany(
      {
        id: displayedCompany.id,
        data: {
          name: draft.name,
          nip: draft.nip || null,
          krs: draft.krs || null,
          regon: draft.regon || null,
          address: draft.address || null,
        },
      },
      {
        onSuccess: () => {
          closeEditModal();
        },
      },
    );
  };

  const saveContactChanges = () => {
    addContact(
      {
        companyId: displayedCompany.id,
        data: {
          name: contactDraft.name || null,
          role: contactDraft.role || null,
          email: contactDraft.email || null,
          phone: contactDraft.phone || null,
          isPrimary: contactDraft.isMainContact,
        },
      },
      {
        onSuccess: () => closeContactAddModal(),
      },
    );
  };

  const openAttachProjectModal = () => {
    resetAttachProject();
    setSelectedAttachProjectId(null);
    setIsAttachProjectModalOpen(true);
  };

  const closeAttachProjectModal = () => {
    resetAttachProject();
    setIsAttachProjectModalOpen(false);
    setSelectedAttachProjectId(null);
  };

  const saveAttachProject = () => {
    if (!selectedAttachProjectId || !displayedCompany) {
      return;
    }

    attachProject(
      {
        id: selectedAttachProjectId,
        data: { companyId: displayedCompany.id },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['companies', displayedCompany.id] });
          queryClient.invalidateQueries({ queryKey: ['companies'] });
          closeAttachProjectModal();
        },
      },
    );
  };

  const toggleNoteMenu = (noteId: string) => {
    setOpenNoteMenuId((current) => (current === noteId ? null : noteId));
  };

  const startEditNote = (note: NoteItem) => {
    setOpenNoteMenuId(null);
    setEditingNoteId(note.id);
    setEditingNoteText(note.content);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleSaveNoteEdit = (e: React.FormEvent, noteId: string) => {
    e.preventDefault();
    const trimmed = editingNoteText.trim();
    if (!trimmed || isUpdatingNote || isOptimisticNoteId(noteId)) return;

    const previousContent = notes.find((note) => note.id === noteId)?.content;

    setNotes((prev) => prev.map((note) => (note.id === noteId ? { ...note, content: trimmed } : note)));
    setEditingNoteId(null);
    setEditingNoteText('');

    updateNote(
      {
        companyId,
        noteId,
        data: { content: trimmed },
      },
      {
        onError: () => {
          if (previousContent !== undefined) {
            setNotes((prev) =>
              prev.map((note) => (note.id === noteId ? { ...note, content: previousContent } : note)),
            );
          }
        },
      },
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setOpenNoteMenuId(null);
    if (isDeletingNote) return;

    const deletedNote = notes.find((note) => note.id === noteId);
    setNotes((prev) => prev.filter((note) => note.id !== noteId));

    if (editingNoteId === noteId) {
      cancelEditNote();
    }

    if (isOptimisticNoteId(noteId)) return;

    deleteNote(
      { companyId, noteId },
      {
        onError: () => {
          if (deletedNote) {
            setNotes((prev) => [deletedNote, ...prev]);
          }
        },
      },
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || isAddingNote) return;

    const contentToSend = newNoteText.trim();

    const now = new Date();
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const optimisticNote: NoteItem = {
      id: `note-${Date.now()}`,
      author: 'Artur Nowak',
      avatarInitials: 'AN',
      dateLabel: formattedDate,
      content: contentToSend,
    };

    setNotes((prev) => [optimisticNote, ...prev]);
    setNewNoteText('');

    createNote(
      {
        companyId,
        data: {
          content: contentToSend,
        },
      },
      {
        onSuccess: (createdNote: CompanyNote) => {
          const backendAuthorName = createdNote.author?.name?.trim() || 'Nieznany autor';
          const nameParts = backendAuthorName.split(' ').filter(Boolean);
          const backendInitials =
            nameParts.map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2) || '??';

          setNotes((prev) =>
            prev.map((n) =>
              n.id === optimisticNote.id
                ? {
                    ...n,
                    id: createdNote.id,
                    author: backendAuthorName,
                    avatarInitials: backendInitials,
                    dateLabel: formatBackendDate(createdNote.createdAt),
                  }
                : n,
            ),
          );
        },
        onError: () => {
          setNotes((prev) => prev.filter((n) => n.id !== optimisticNote.id));
        },
      },
    );
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
                    {displayedCompany.emails.length > 0 ? (
                      displayedCompany.emails.map((email, index) => (
                        <p key={index} className="text-sm text-gray-800">
                          {email}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-800">—</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Osoby kontaktowe</h3>
                <div className="space-y-3">
                  {contactsToShow.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start justify-between bg-[#F9FAFB] border border-gray-200 rounded-[10px] p-4"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{contact.name ?? '—'}</h4>
                          {mainContactId != null && contact.id === mainContactId && (
                            <span className="rounded-full bg-scrumdone-blue-main px-2 py-1 text-xs font-medium text-white">
                              Główny kontakt
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{contact.role ?? '—'}</p>
                        <div className="mt-3 mx-auto flex max-w-180 items-center justify-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{contact.email ?? '—'}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{contact.phone ?? '—'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors rounded hover:bg-red-50"
                        title="Usuń kontakt"
                      >
                        <Trash2 size={16} />
                      </button>
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
                  Aktywne projekty ({isCompanyProjectsLoading ? '...' : companyProjectsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`relative z-10 rounded-[14px] px-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-[#0F172A]' : 'text-[#111827] hover:text-[#0F172A]'}`}
                >
                  Historia współpracy ({isLogsLoading ? '...' : logsData?.totalCount ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`relative z-10 rounded-[14px] px-3 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-[#0F172A]' : 'text-[#111827] hover:text-[#0F172A]'}`}
                >
                  Notatki ({isNotesLoading ? '...' : totalNotesCount})
                </button>
              </div>

              <button
                type="button"
                onClick={openAttachProjectModal}
                className="mr-3 inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-scrumdone-blue-main px-4 text-sm font-medium leading-2.5 text-white transition-all hover:bg-[#00A0DD] active:scale-95"
              >
                <PlusIcon className="h-4 w-4 stroke-2" />
                Podepnij projekt
              </button>
            </div>

            {activeTab === 'projects' && (
              <section className="mx-8 mb-8 space-y-6">
                {isCompanyProjectsLoading && (
                  <p className="text-sm text-slate-500 animate-pulse">Ładowanie projektów...</p>
                )}

                {isCompanyProjectsError && (
                  <p className="text-sm text-red-700">
                    Nie udało się załadować projektów{companyProjectsError?.message ? `: ${companyProjectsError.message}` : '.'}
                  </p>
                )}

                {!isCompanyProjectsLoading && !isCompanyProjectsError && companyProjectCards.length > 0 &&
                  companyProjectCards.map((project) => (
                    <CompanyProjectListItem key={project.id} {...project} />
                  ))}

                {!isCompanyProjectsLoading && !isCompanyProjectsError && companyProjectCards.length === 0 && (
                  <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    Brak aktywnych projektów powiązanych z tą firmą.
                  </div>
                )}
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
                {isLogsLoading && (
                  <p className="text-sm text-gray-500 py-4 animate-pulse">Ładowanie historii współpracy...</p>
                )}

                {isLogsError && (
                  <p className="text-sm text-red-500 py-4">Wystąpił błąd podczas pobierania historii współpracy.</p>
                )}

                {!isLogsLoading && !isLogsError && cooperationHistory.length === 0 && (
                  <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    Brak wpisów w historii współpracy dla tej firmy.
                  </div>
                )}

                <div className="space-y-8">
                  {!isLogsLoading && !isLogsError && cooperationHistory.map((item, index) => (
                    <article key={item.id} className="relative grid grid-cols-[var(--history-col-width)_minmax(0,1fr)] gap-4 lg:grid-cols-[var(--history-col-width)_minmax(0,1fr)_auto] lg:items-start">
                      {index < cooperationHistory.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[calc(var(--history-col-width)/2)] top-[calc(var(--history-icon-size)/2)] h-[calc(100%+1.5rem)] w-px -translate-x-1/2 bg-slate-200"
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

                      <div className="flex items-start justify-between lg:flex-col lg:items-end gap-2">
                        <p className="font-segoe-ui text-[14px] leading-6 text-slate-500 antialiased lg:text-right">
                          {item.dateLabel}
                        </p>
                        <button
                          onClick={() => handleDeleteLog(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors rounded hover:bg-red-50"
                          title="Usuń wpis"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'notes' && (
              <section className="mx-8 mb-8 rounded-[14px] border border-gray-200 bg-white p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm text-gray-900 mb-3">Dodaj nową notatkę</h3>
                  {isAddNoteError && (
                    <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {addNoteError?.message || 'Błąd podczas dodawania notatki'}
                    </div>
                  )}
                  <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Wpisz treść notatki..."
                      disabled={isAddingNote}
                      className="w-full min-h-[88px] rounded-xl bg-[#F9FAFB] p-3 text-sm text-gray-900 placeholder-gray-500 border-none resize-none focus:outline-none focus:ring-1 focus:ring-scrumdone-blue-main transition-all disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim() || isAddingNote}
                      className="self-start h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] disabled:opacity-50 disabled:hover:bg-scrumdone-blue-main text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium leading-2.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <PlusIcon className="w-4 h-4 stroke-2" />
                      <span>{isAddingNote ? 'Dodawanie...' : 'Dodaj notatkę'}</span>
                    </button>
                  </form>
                </div>

                <div className="flex flex-col gap-4">
                  {isNotesLoading && (
                    <p className="text-sm text-gray-500 py-4 animate-pulse">Ładowanie notatek z serwera...</p>
                  )}

                  {isNotesError && (
                    <p className="text-sm text-red-500 py-4">Wystąpił błąd podczas pobierania notatek z backendu.</p>
                  )}

                  {!isNotesLoading && !isNotesError && notes.length === 0 && (
                    <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      Brak notatek dla tej firmy. Dodaj pierwszą notatkę powyżej.
                    </div>
                  )}

                  {!isNotesLoading && !isNotesError && notes.map((note) => (
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
                        <div
                          className="relative"
                          ref={openNoteMenuId === note.id ? noteMenuRef : undefined}
                        >
                          <button
                            type="button"
                            onClick={() => toggleNoteMenu(note.id)}
                            aria-label="Opcje notatki"
                            aria-expanded={openNoteMenuId === note.id}
                            aria-haspopup="menu"
                            className={`text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md ${
                              openNoteMenuId === note.id ? 'border border-gray-300 bg-white text-gray-600' : ''
                            }`}
                          >
                            <MoreVertical className="w-5 h-5 stroke-[1.5]" />
                          </button>

                          {openNoteMenuId === note.id && (
                            <div
                              role="menu"
                              className="absolute right-0 top-full z-10 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => startEditNote(note)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <Pencil className="h-4 w-4 stroke-[1.5]" />
                                Edytuj
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleDeleteNote(note.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 stroke-[1.5]" />
                                Usuń
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {editingNoteId === note.id ? (
                        <form onSubmit={(e) => handleSaveNoteEdit(e, note.id)} className="flex flex-col gap-3">
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            disabled={isUpdatingNote}
                            className="w-full min-h-[88px] rounded-xl bg-white p-3 text-sm text-gray-900 border border-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-scrumdone-blue-main transition-all disabled:opacity-60"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={!editingNoteText.trim() || isUpdatingNote}
                              className="h-8 px-3 bg-scrumdone-blue-main hover:bg-[#00A0DD] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all"
                            >
                              {isUpdatingNote ? 'Zapisywanie...' : 'Zapisz'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditNote}
                              disabled={isUpdatingNote}
                              className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              Anuluj
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm font-normal leading-6 text-[#1F2937] antialiased whitespace-pre-wrap">
                          {note.content}
                        </p>
                      )}
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
        onDelete={handleDeleteCompany}
        onDraftChange={setDraft}
        onAddLog={handleAddLog}
        isSaving={isSavingCompany}
        errorMessage={isUpdateCompanyError ? updateCompanyError?.message : null}
      />

      <CompanyContactAddModal
        isOpen={isContactAddModalOpen}
        draft={contactDraft}
        onClose={closeContactAddModal}
        onSave={saveContactChanges}
        onDraftChange={setContactDraft}
        isSaving={isAddingContact}
        errorMessage={isAddContactError ? addContactError?.message : null}
      />

      <CompanyAttachProjectModal
        isOpen={isAttachProjectModalOpen}
        companyName={displayedCompany.name}
        availableProjects={availableAttachProjects}
        selectedProjectId={selectedAttachProjectId}
        isLoading={isAttachProjectsLoading}
        isSaving={isAttachingProject}
        errorMessage={isAttachProjectError ? attachProjectError?.message : null}
        onClose={closeAttachProjectModal}
        onSave={saveAttachProject}
        onProjectSelect={setSelectedAttachProjectId}
      />

    </div>
  );
};

export default CompanyDetailsPage;