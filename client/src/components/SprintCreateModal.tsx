import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { SprintEditDraft } from './SprintEditModal';
import {
  deriveSprintStatusFromDisplayDates,
  getDefaultDatesForSprintStatus,
} from '../utils/sprintDisplay';

type SprintCreateModalProps = {
  isOpen: boolean;
  draft: SprintEditDraft | null;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (draft: SprintEditDraft | null) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

const statusOptions: SprintEditDraft['status'][] = ['Zaplanowany', 'Aktywny', 'Ukończony'];

const SprintCreateModal: React.FC<SprintCreateModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
  onDraftChange,
  isSaving = false,
  errorMessage = null,
}) => {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    if (isStatusOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsStatusOpen(false);
    }
  }, [isOpen]);

  if (!isOpen || !draft) {
    return null;
  }

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

  const handleStatusSelect = (status: SprintEditDraft['status']) => {
    const dates = getDefaultDatesForSprintStatus(status);
    onDraftChange({
      ...draft,
      status,
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
    setIsStatusOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div
        className="flex w-full max-w-[560px] flex-col overflow-visible rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-8 pb-4 pt-8">
          <div>
            <h2 className="mb-2 font-segoe-ui text-[20px] font-semibold tracking-[-0.44px] text-slate-900">
              Dodaj nowy sprint
            </h2>
            <p className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-slate-500">
              Wypełnij dane nowego sprintu i kliknij Zapisz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno dodawania sprintu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-visible space-y-5 px-8 pb-6">
          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-segoe-ui text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="create-sprint-name">
              Nazwa sprintu
            </label>
            <input
              id="create-sprint-name"
              type="text"
              placeholder="np. Sprint 3"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main disabled:opacity-60"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="create-sprint-start-date">
                Data rozpoczęcia
              </label>
              <input
                id="create-sprint-start-date"
                type="date"
                value={draft.startDate}
                onChange={(event) => updateDraft({ startDate: event.target.value })}
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors focus:border-scrumdone-blue-main disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="create-sprint-end-date">
                Data zakończenia
              </label>
              <input
                id="create-sprint-end-date"
                type="date"
                value={draft.endDate}
                onChange={(event) => updateDraft({ endDate: event.target.value })}
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors focus:border-scrumdone-blue-main disabled:opacity-60"
              />
            </div>
          </div>

          <div ref={statusDropdownRef} className="relative">
            <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700">
              Status
            </label>
            <button
              type="button"
              onClick={() => setIsStatusOpen((open) => !open)}
              disabled={isSaving}
              className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors focus:border-scrumdone-blue-main disabled:opacity-60"
            >
              <span>{draft.status}</span>
              <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {statusOptions.map((status) => {
                  const isSelected = draft.status === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusSelect(status)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left font-segoe-ui text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{status}</span>
                      {isSelected ? <CheckIcon className="h-4 w-4 text-slate-900" strokeWidth={2.5} /> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="relative z-0 flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !draft.title.trim() || !draft.startDate || !draft.endDate}
            className="rounded-lg bg-scrumdone-blue-main px-5 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD] disabled:opacity-50"
          >
            {isSaving ? 'Zapisywanie…' : 'Zapisz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprintCreateModal;
