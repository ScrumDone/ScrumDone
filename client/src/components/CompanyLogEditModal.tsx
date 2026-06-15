import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { COOPERATION_EVENT_TYPES } from '../constants/cooperationEventTypes';
import type { CompanyLogEditDraft } from '../utils/cooperationLogDisplay';

type CompanyLogEditModalProps = {
  isOpen: boolean;
  draft: CompanyLogEditDraft;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (updater: (prev: CompanyLogEditDraft) => CompanyLogEditDraft) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

const CompanyLogEditModal: React.FC<CompanyLogEditModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
  onDraftChange,
  isSaving = false,
  errorMessage = null,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div
        className="flex max-h-[86vh] w-full max-w-130 flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-8">
          <div>
            <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">
              Edytuj wpis historii
            </h2>
            <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">
              Zmień dane wpisu i kliknij Zapisz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno edycji wpisu historii"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900" htmlFor="company-log-edit-title">
              Tytuł
            </label>
            <input
              id="company-log-edit-title"
              type="text"
              value={draft.title}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-scrumdone-blue-main"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900" htmlFor="company-log-edit-type">
              Typ wydarzenia
            </label>
            <select
              id="company-log-edit-type"
              value={draft.eventType}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, eventType: event.target.value }))}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-scrumdone-blue-main"
            >
              {COOPERATION_EVENT_TYPES.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900" htmlFor="company-log-edit-date">
              Data
            </label>
            <input
              id="company-log-edit-date"
              type="date"
              value={draft.date}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, date: event.target.value }))}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-scrumdone-blue-main"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900" htmlFor="company-log-edit-description">
              Opis
            </label>
            <textarea
              id="company-log-edit-description"
              rows={3}
              value={draft.description}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full resize-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-scrumdone-blue-main"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
          {errorMessage && <p className="mr-auto text-sm text-red-600">{errorMessage}</p>}
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !draft.title.trim()}
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm font-medium text-white hover:bg-[#00A0DD] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Zapisywanie…' : 'Zapisz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogEditModal;
