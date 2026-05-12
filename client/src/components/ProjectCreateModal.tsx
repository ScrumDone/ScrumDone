import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import { companies } from '../data/companies';

export type TeamMemberOption = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
};

export type EditProjectDraft = {
  name: string;
  clientId?: string;
  clientName: string;
  description: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
  workMode?: 'kanban' | 'scrum';
};

type ProjectCreateModalProps = {
  isOpen: boolean;
  draft: EditProjectDraft;
  members: TeamMemberOption[];
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (updater: (prev: EditProjectDraft) => EditProjectDraft) => void;
  onToggleMember: (memberId: string) => void;
};

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  draft,
  members,
  onClose,
  onSave,
  onDraftChange,
  onToggleMember,
}) => {
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [memberSearchValue, setMemberSearchValue] = useState('');
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };

    if (isClientDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClientDropdownOpen]);

  const filteredCompanies = useMemo(() => companies, []);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = memberSearchValue.trim().toLocaleLowerCase('pl-PL');

    if (!normalizedSearch) {
      return members;
    }

    return members.filter(
      (member) =>
        member.fullName.toLocaleLowerCase('pl-PL').includes(normalizedSearch) ||
        member.email.toLocaleLowerCase('pl-PL').includes(normalizedSearch),
    );
  }, [memberSearchValue, members]);

  const selectedClientLabel = draft.clientName || 'Wybierz klienta';
  const sharedFieldClassName = 'w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main';

  const handleClientSelect = (companyId: number, companyName: string) => {
    onDraftChange((prev) => ({
      ...prev,
      clientId: String(companyId),
      clientName: companyName,
    }));
    setIsClientDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div className="flex max-h-[75vh] w-full max-w-150 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="font-segoe-ui text-[18px] font-semibold text-slate-900">Nowy projekt</h2>
            <p className="text-sm text-slate-500">Utwórz nowy projekt i przypisz do niego zespół</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Zamknij">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nazwa projektu</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onDraftChange((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Wpisz nazwę projektu"
              className={sharedFieldClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Klient</label>
            <div className="relative" ref={clientDropdownRef}>
              <button
                type="button"
                onClick={() => setIsClientDropdownOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 text-left text-[15px] text-slate-400 outline-none transition-colors hover:border-slate-200 focus:border-scrumdone-blue-main"
              >
                <span className={draft.clientName ? 'text-slate-900' : 'text-slate-500'}>{selectedClientLabel}</span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isClientDropdownOpen ? (
                <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-md">
                  <div className="max-h-56 overflow-y-auto">
                    {filteredCompanies.map((company) => {
                      return (
                        <button
                          key={company.id}
                          type="button"
                          onClick={() => handleClientSelect(company.id, company.name)}
                          className="w-full rounded-lg px-3 py-1 text-left transition-colors hover:bg-slate-100"
                        >
                          <div className="font-segoe-ui text-[15px] leading-6 text-slate-900">{company.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Opis projektu</label>
            <textarea
              value={draft.description}
              onChange={(e) => onDraftChange((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Wpisz opis projektu"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data rozpoczęcia</label>
              <div className="relative">
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => onDraftChange((prev) => ({ ...prev, startDate: e.target.value }))}
                  placeholder="dd/mm/yyyy"
                  className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 pr-10 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
                />
                <CalendarDaysIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Data zakończenia</label>
              <div className="relative">
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => onDraftChange((prev) => ({ ...prev, endDate: e.target.value }))}
                  placeholder="dd/mm/yyyy"
                  className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 pr-10 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
                />
                <CalendarDaysIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Tryb pracy</div>
            <div className="flex gap-2">
              <button type="button" className={`rounded-md bg-scrumdone-blue-main px-4 py-1 text-sm text-white`}>Kanban</button>
              <button type="button" className={`px-4 py-1 rounded-md ${draft.workMode === 'scrum' ? 'bg-[#00AEEF] text-white' : 'bg-white border'}`}>Scrum</button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Członkowie zespołu</label>
            <div className="mb-3 relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={memberSearchValue}
                onChange={(event) => setMemberSearchValue(event.target.value)}
                placeholder="Szukaj osoby..."
                className="w-full rounded-lg border border-slate-100 bg-slate-100 py-1 pl-10 pr-3 text-[15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>
            <div className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2">
              <div className="max-h-48 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <label key={member.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar initials={member.initials} size="md" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{member.fullName}</div>
                        <div className="text-[12px] text-slate-400">{member.email}</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={draft.memberIds.includes(member.id)} onChange={() => onToggleMember(member.id)} className="h-4 w-4" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">Anuluj</button>
          <button onClick={onSave} className="rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm text-white">Utwórz projekt</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreateModal;
