import React from 'react';
import { CalendarDaysIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type SprintEditDraft = {
  title: string;
  startDate: string;
  endDate: string;
  status: 'Aktywny' | 'Zaplanowany' | 'Ukończony';
};

type SprintEditModalProps = {
  isOpen: boolean;
  draft: SprintEditDraft | null;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (draft: SprintEditDraft | null) => void;
  onStartNextSprint: () => void;
  onExtendSprint: () => void;
  onDeleteSprint: () => void;
};

const sprintStatusOptions: SprintEditDraft['status'][] = ['Aktywny', 'Zaplanowany', 'Ukończony'];

const SprintEditModal: React.FC<SprintEditModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
  onDraftChange,
  onStartNextSprint,
  onExtendSprint,
  onDeleteSprint,
}) => {
  if (!isOpen || !draft) {
    return null;
  }

  const updateDraft = (partialDraft: Partial<SprintEditDraft>) => {
    onDraftChange({
      ...draft,
      ...partialDraft,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div
        className="flex max-h-[86vh] w-full max-w-190 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-8">
          <div>
            <h2 className="mb-2 font-segoe-ui text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Edycja sprintu</h2>
            <p className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-slate-500">Zarządzaj aktywnym sprintem projektu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno edycji sprintu"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="sprint-name-input">
              Nazwa sprintu
            </label>
            <input
              id="sprint-name-input"
              type="text"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="sprint-start-date-input">
                Data rozpoczęcia
              </label>
              <input
                id="sprint-start-date-input"
                type="text"
                value={draft.startDate}
                onChange={(event) => updateDraft({ startDate: event.target.value })}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>

            <div>
              <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="sprint-end-date-input">
                Data zakończenia
              </label>
              <input
                id="sprint-end-date-input"
                type="text"
                value={draft.endDate}
                onChange={(event) => updateDraft({ endDate: event.target.value })}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="sprint-status-select">
              Status sprintu
            </label>
            <div className="relative">
              <select
                id="sprint-status-select"
                value={draft.status}
                onChange={(event) => updateDraft({ status: event.target.value as SprintEditDraft['status'] })}
                className="w-full appearance-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors focus:border-scrumdone-blue-main"
              >
                {sprintStatusOptions.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 block font-segoe-ui text-[15px] font-medium text-slate-800">Akcje sprintu</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onStartNextSprint}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#2563EB] transition-colors hover:bg-slate-50"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm leading-5 tracking-[-0.15px]">Zamknij i rozpocznij nowy sprint</span>
              </button>

              <button
                type="button"
                onClick={onExtendSprint}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#7C3AED] transition-colors hover:bg-slate-50"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="text-sm leading-5 tracking-[-0.15px]">Przedłuż sprint o tydzień</span>
              </button>

              <button
                type="button"
                onClick={onDeleteSprint}
                className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#DC2626] transition-colors hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4" />
                <span className="text-sm leading-5 tracking-[-0.15px]">Usuń sprint</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
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

export default SprintEditModal;