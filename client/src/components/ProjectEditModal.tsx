import React from 'react';
import {
  ArchiveBoxIcon,
  BuildingOffice2Icon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Avatar from './Avatar';

export type TeamMemberOption = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
};

export type EditProjectDraft = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
};

type ProjectEditModalProps = {
  isOpen: boolean;
  draft: EditProjectDraft;
  members: TeamMemberOption[];
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (updater: (prev: EditProjectDraft) => EditProjectDraft) => void;
  onToggleMember: (memberId: string) => void;
};

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  draft,
  members,
  onClose,
  onSave,
  onDraftChange,
  onToggleMember,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-190 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between  px-6 pb-4 pt-8">
          <div>
            <h2 className="font-segoe-ui text-[18px] leading-4.5 mb-2 tracking-[-0.44px] font-semibold text-slate-900">Edycja projektu</h2>
            <p className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-slate-500">Zarządzaj ustawieniami i zespołem projektu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno edycji projektu"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block font-segoe-ui text-sm leading-3.5 tracking-[-0.15px] font-medium text-slate-700" htmlFor="project-name-input">
              Nazwa projektu
            </label>
            <input
              id="project-name-input"
              type="text"
              value={draft.name}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm text-slate-500 tracking-[-0.15px] outline-none transition-colors focus:border-scrumdone-blue-main"
            />
          </div>

          <div>
            <label className="mb-2 block font-segoe-ui text-sm leading-3.5 tracking-[-0.15px] font-medium text-slate-700" htmlFor="project-description-input">
              Opis projektu
            </label>
            <textarea
              id="project-description-input"
              value={draft.description}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm text-slate-500 tracking-[-0.15px] outline-none transition-colors focus:border-scrumdone-blue-main"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-segoe-ui text-sm leading-3.5 tracking-[-0.15px] font-medium text-slate-700" htmlFor="project-start-date-input">
                Data rozpoczęcia
              </label>
              <input
                id="project-start-date-input"
                type="text"
                value={draft.startDate}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, startDate: event.target.value }))}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm text-slate-500 tracking-[-0.15px] outline-none transition-colors focus:border-scrumdone-blue-main"
              />
            </div>

            <div>
              <label className="mb-2 block font-segoe-ui text-sm leading-3.5 tracking-[-0.15px] font-medium text-slate-700" htmlFor="project-end-date-input">
                Data zakończenia
              </label>
              <input
                id="project-end-date-input"
                type="text"
                value={draft.endDate}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, endDate: event.target.value }))}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm text-slate-500 tracking-[-0.15px] outline-none transition-colors focus:border-scrumdone-blue-main"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 block font-segoe-ui text-sm leading-3.5 tracking-[-0.15px] font-medium text-slate-800">Członkowie zespołu</h3>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="max-h-60 overflow-y-auto pr-1">
                {members.map((member) => {
                  const isChecked = draft.memberIds.includes(member.id);

                  return (
                    <label key={member.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Avatar initials={member.initials} size="md" />
                        <div>
                          <p className="font-segoe-ui text-[16px] font-medium text-slate-900">{member.fullName}</p>
                          <p className="font-segoe-ui text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleMember(member.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                        aria-label={`Wybierz ${member.fullName}`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 block font-segoe-ui text-[15px] font-medium text-slate-800">Akcje projektu</h3>

            <div className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#2563EB] transition-colors hover:bg-slate-50"
              >
                <BuildingOffice2Icon className="h-5 w-5" />
                <span>Zmień klienta</span>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#7C3AED] transition-colors hover:bg-slate-50"
              >
                <ArchiveBoxIcon className="h-5 w-5" />
                <span>Archiwizuj projekt</span>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#DC2626] transition-colors hover:bg-red-100"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Usuń projekt</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD]"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditModal;
