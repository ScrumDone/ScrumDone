import React from 'react';
import { CalendarDaysIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { deriveSprintStatusFromDisplayDates } from '../utils/sprintDisplay';

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
  isSaving?: boolean;
  errorMessage?: string | null;
};

const SprintEditModal: React.FC<SprintEditModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
  onDraftChange,
  onStartNextSprint,
  onExtendSprint,
  onDeleteSprint,
  isSaving = false,
  errorMessage = null,
}) => {
  if (!isOpen || !draft) {
    return null;
  }

  const displayedStatus = deriveSprintStatusFromDisplayDates(draft.startDate, draft.endDate);

  const updateDraft = (partialDraft: Partial<SprintEditDraft>) => {
    const nextDraft = {
      ...draft,
      ...partialDraft,
    };

    onDraftChange({
      ...nextDraft,
      status: deriveSprintStatusFromDisplayDates(nextDraft.startDate, nextDraft.endDate),
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
          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-segoe-ui text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="sprint-name-input">
              Nazwa sprintu
            </label>
            <input
              id="sprint-name-input"
              type="text"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main disabled:opacity-60"
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
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main disabled:opacity-60"
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
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700">
              Status sprintu
            </p>
            <p className="rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700">
              {displayedStatus}
            </p>
            <p className="mt-1 font-segoe-ui text-xs text-slate-500">Wyliczany automatycznie na podstawie dat sprintu.</p>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 block font-segoe-ui text-[15px] font-medium text-slate-800">Akcje sprintu</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onStartNextSprint}
                disabled={isSaving}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#2563EB] transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm leading-5 tracking-[-0.15px]">Zamknij i rozpocznij nowy sprint</span>
              </button>

              <button
                type="button"
                onClick={onExtendSprint}
                disabled={isSaving}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#7C3AED] transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="text-sm leading-5 tracking-[-0.15px]">Przedłuż sprint o tydzień</span>
              </button>

              <button
                type="button"
                onClick={onDeleteSprint}
                disabled={isSaving}
                className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 font-segoe-ui text-lg font-medium text-[#DC2626] transition-colors hover:bg-red-100 disabled:opacity-60"
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
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !draft.title.trim()}
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD] disabled:opacity-50"
          >
            {isSaving ? 'Zapisywanie…' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprintEditModal;