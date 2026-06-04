import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type CompanyLogDraft = {
  title: string;
  description: string;
};

type CompanyLogAddModalProps = {
  isOpen: boolean;
  draft: CompanyLogDraft;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (updater: (prev: CompanyLogDraft) => CompanyLogDraft) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

const CompanyLogAddModal: React.FC<CompanyLogAddModalProps> = ({
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
            <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Dodaj wpis historii</h2>
            <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">Dodaj nowy wpis do historii współpracy</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno dodawania wpisu"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium leading-5 text-slate-900" htmlFor="company-log-title-input">
              Tytuł
            </label>
            <input
              id="company-log-title-input"
              type="text"
              value={draft.title}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Wysłano email"
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-3 text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium leading-5 text-slate-900" htmlFor="company-log-description-input">
              Opis
            </label>
            <textarea
              id="company-log-description-input"
              value={draft.description}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Wysłano email do Anny Wiśniewskiej z aktualizacją projektu."
              rows={4}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-3 text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main resize-none"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !draft.title.trim()}
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm font-medium text-white hover:bg-[#00A0DD] disabled:opacity-50 disabled:hover:bg-scrumdone-blue-main"
          >
            {isSaving ? 'Dodawanie...' : 'Dodaj wpis'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogAddModal;
