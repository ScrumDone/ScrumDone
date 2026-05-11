import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type CompanyContactDraft = {
  name: string;
  role: string;
  email: string;
  phone: string;
  isMainContact: boolean;
};

type CompanyContactAddModalProps = {
  isOpen: boolean;
  draft: CompanyContactDraft;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (updater: (prev: CompanyContactDraft) => CompanyContactDraft) => void;
};

const CompanyContactAddModal: React.FC<CompanyContactAddModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
  onDraftChange,
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
            <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Dodaj osobę kontaktową</h2>
            <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">Dodaj nową osobę kontaktową do firmy</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno dodawania osoby kontaktowej"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium leading-5 text-slate-900" htmlFor="company-contact-name-input">
                Imię i nazwisko
              </label>
              <input
                id="company-contact-name-input"
                type="text"
                value={draft.name}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Jan Kowalski"
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-3 text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium leading-5 text-slate-900" htmlFor="company-contact-role-input">
                Stanowisko
              </label>
              <input
                id="company-contact-role-input"
                type="text"
                value={draft.role}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, role: event.target.value }))}
                placeholder="CEO"
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-3 text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium leading-5 text-slate-900" htmlFor="company-contact-email-input">
                Email
              </label>
              <input
                id="company-contact-email-input"
                type="email"
                value={draft.email}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="jan.kowalski@firma.pl"
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-3 text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium leading-5 text-slate-900" htmlFor="company-contact-phone-input">
                Telefon
              </label>
              <input
                id="company-contact-phone-input"
                type="text"
                value={draft.phone}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="+48 000 000 000"
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-3 text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 pt-1 text-sm font-medium text-slate-900">
            <input
              type="checkbox"
              checked={draft.isMainContact}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, isMainContact: event.target.checked }))}
              className="h-5 w-5 rounded border-slate-200 text-scrumdone-blue-main focus:ring-scrumdone-blue-main"
            />
            <span>Główny kontakt</span>
          </label>
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
            className="inline-flex items-center gap-2 rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Dodaj kontakt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyContactAddModal;