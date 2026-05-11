import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';

export type TeamMemberOption = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
};

export type EditProjectDraft = {
  name: string;
  clientId?: string;
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div className="w-full max-w-150 rounded-lg border border-slate-200 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="font-segoe-ui text-[18px] font-semibold text-slate-900">Nowy projekt</h2>
            <p className="text-sm text-slate-500">Utwórz nowy projekt i przypisz do niego zespół</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Zamknij">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nazwa projektu</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onDraftChange((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Wpisz nazwę projektu"
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 text-sm text-slate-500 outline-none focus:border-scrumdone-blue-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Klient</label>
            <div className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 text-sm text-slate-500">Wybierz klienta</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Opis projektu</label>
            <textarea
              value={draft.description}
              onChange={(e) => onDraftChange((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Wpisz opis projektu"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none focus:border-scrumdone-blue-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data rozpoczęcia</label>
              <input
                type="text"
                value={draft.startDate}
                onChange={(e) => onDraftChange((prev) => ({ ...prev, startDate: e.target.value }))}
                placeholder=""
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 text-sm text-slate-500 outline-none focus:border-scrumdone-blue-main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data zakończenia</label>
              <input
                type="text"
                value={draft.endDate}
                onChange={(e) => onDraftChange((prev) => ({ ...prev, endDate: e.target.value }))}
                placeholder=""
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-1 text-sm text-slate-500 outline-none focus:border-scrumdone-blue-main"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Tryb pracy</div>
            <div className="flex gap-2">
              <button type="button" className={`px-4 py-1 rounded-md ${draft.workMode === 'kanban' ? 'bg-[#00AEEF] text-white' : 'bg-white border'}`}>Kanban</button>
              <button type="button" className={`px-4 py-1 rounded-md ${draft.workMode === 'scrum' ? 'bg-[#00AEEF] text-white' : 'bg-white border'}`}>Scrum</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Członkowie zespołu</label>
            <div className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2">
              <input placeholder="Szukaj osoby..." className="w-full bg-transparent text-sm text-slate-500 outline-none" />
              <div className="max-h-48 overflow-y-auto mt-2">
                {members.map((member) => (
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
