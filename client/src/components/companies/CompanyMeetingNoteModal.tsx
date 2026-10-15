import React, { useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ContactPerson } from '../../types/contact';
import type { UserSummary } from '../../types/user';
import { DEFAULT_MEETING_TITLE, type MeetingNoteDraft } from '../../utils/meetingNote';
import { companyModalOverlayClass, companyModalPanelClass } from './companyModalClasses';

type CompanyMeetingNoteModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  draft: MeetingNoteDraft;
  contacts: ContactPerson[];
  users: UserSummary[];
  isParticipantsLoading?: boolean;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (updater: (prev: MeetingNoteDraft) => MeetingNoteDraft) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

type ParticipantOption = {
  key: string;
  name: string;
  hint: string | null;
};

const inputClassName =
  'w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-scrumdone-blue-main';

const CompanyMeetingNoteModal: React.FC<CompanyMeetingNoteModalProps> = ({
  isOpen,
  mode,
  draft,
  contacts,
  users,
  isParticipantsLoading = false,
  onClose,
  onSave,
  onDraftChange,
  isSaving = false,
  errorMessage = null,
}) => {
  const [search, setSearch] = useState('');

  const contactOptions = useMemo<ParticipantOption[]>(
    () =>
      contacts
        .filter((contact) => contact.name?.trim())
        .map((contact) => ({ key: `contact-${contact.id}`, name: contact.name!.trim(), hint: contact.role?.trim() || null })),
    [contacts],
  );

  const userOptions = useMemo<ParticipantOption[]>(
    () => users.filter((user) => user.name?.trim()).map((user) => ({ key: `user-${user.id}`, name: user.name.trim(), hint: null })),
    [users],
  );

  // Uczestnicy zapisani wcześniej, których nie ma już na listach (np. usunięty kontakt)
  const unknownParticipants = useMemo(() => {
    const knownNames = new Set([...contactOptions, ...userOptions].map((option) => option.name));
    return draft.participants.filter((name) => !knownNames.has(name));
  }, [draft.participants, contactOptions, userOptions]);

  if (!isOpen) {
    return null;
  }

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (option: ParticipantOption) => !normalizedSearch || option.name.toLowerCase().includes(normalizedSearch);

  const toggleParticipant = (name: string) => {
    onDraftChange((prev) => ({
      ...prev,
      participants: prev.participants.includes(name)
        ? prev.participants.filter((participant) => participant !== name)
        : [...prev.participants, name],
    }));
  };

  const renderGroup = (label: string, options: ParticipantOption[], emptyLabel: string) => {
    const visibleOptions = options.filter(matchesSearch);

    return (
      <div>
        <p className="px-2 pb-1 pt-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        {visibleOptions.length === 0 && <p className="px-2 py-1 text-[13px] text-slate-500">{emptyLabel}</p>}
        {visibleOptions.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={draft.participants.includes(option.name)}
              onChange={() => toggleParticipant(option.name)}
              className="h-4 w-4 accent-scrumdone-blue-main"
            />
            <span className="min-w-0 truncate">{option.name}</span>
            {option.hint && <span className="ml-auto shrink-0 text-[12px] text-slate-400">{option.hint}</span>}
          </label>
        ))}
      </div>
    );
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <div className={`${companyModalOverlayClass} z-50`} onClick={handleClose}>
      <div
        className={`${companyModalPanelClass} overflow-hidden`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-8">
          <div>
            <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">
              {mode === 'create' ? 'Dodaj notatkę ze spotkania' : 'Edytuj notatkę ze spotkania'}
            </h2>
            <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">
              Notatka zostanie zapisana w historii współpracy.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno notatki ze spotkania"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900" htmlFor="meeting-note-title">
              Tytuł
            </label>
            <input
              id="meeting-note-title"
              type="text"
              value={draft.title}
              placeholder={DEFAULT_MEETING_TITLE}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, title: event.target.value }))}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900" htmlFor="meeting-note-date">
              Data spotkania
            </label>
            <input
              id="meeting-note-date"
              type="date"
              value={draft.date}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, date: event.target.value }))}
              className={inputClassName}
            />
          </div>

          <div>
            <p className="mb-2 block text-sm font-medium text-slate-900">Uczestnicy</p>

            {draft.participants.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {draft.participants.map((name) => (
                  <span
                    key={name}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[12px] font-medium ${
                      unknownParticipants.includes(name)
                        ? 'border-slate-300 text-slate-500'
                        : 'border-scrumdone-blue-main text-scrumdone-blue-main'
                    }`}
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => toggleParticipant(name)}
                      className="rounded hover:bg-slate-100"
                      aria-label={`Usuń uczestnika ${name}`}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              value={search}
              placeholder="Szukaj osoby..."
              onChange={(event) => setSearch(event.target.value)}
              className={inputClassName}
            />

            <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200 p-1">
              {isParticipantsLoading ? (
                <p className="px-2 py-2 text-[13px] text-slate-500 animate-pulse">Ładowanie osób...</p>
              ) : (
                <>
                  {renderGroup('Osoby kontaktowe', contactOptions, 'Brak osób kontaktowych.')}
                  {renderGroup('Zespół', userOptions, 'Brak użytkowników.')}
                </>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900" htmlFor="meeting-note-content">
              Treść notatki
            </label>
            <textarea
              id="meeting-note-content"
              rows={5}
              value={draft.content}
              placeholder="Ustalenia, kolejne kroki..."
              onChange={(event) => onDraftChange((prev) => ({ ...prev, content: event.target.value }))}
              className={`${inputClassName} resize-none`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
          {errorMessage && <p className="mr-auto text-sm text-red-600">{errorMessage}</p>}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !draft.date || !draft.content.trim()}
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm font-medium text-white hover:bg-[#00A0DD] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Zapisywanie…' : 'Zapisz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyMeetingNoteModal;
