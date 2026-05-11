import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type CompanyEditDraft = {
  name: string;
  nip: string;
  krs: string;
  regon: string;
  address: string;
};

type CompanyEditModalProps = {
  isOpen: boolean;
  draft: CompanyEditDraft;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (updater: (prev: CompanyEditDraft) => CompanyEditDraft) => void;
};

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
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
            <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Edytuj firmę</h2>
            <p className=" text-sm leading-5 tracking-[-0.15px] text-slate-500">Zaktualizuj informacje o firmie</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno edycji firmy"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="company-name-input">
              Nazwa firmy
            </label>
            <input
              id="company-name-input"
              type="text"
              value={draft.name}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="company-nip-input">
                NIP
              </label>
              <input
                id="company-nip-input"
                type="text"
                value={draft.nip}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, nip: event.target.value }))}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>

            <div>
              <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="company-krs-input">
                KRS
              </label>
              <input
                id="company-krs-input"
                type="text"
                value={draft.krs}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, krs: event.target.value }))}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>

            <div>
              <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="company-regon-input">
                REGON
              </label>
              <input
                id="company-regon-input"
                type="text"
                value={draft.regon}
                onChange={(event) => onDraftChange((prev) => ({ ...prev, regon: event.target.value }))}
                className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-segoe-ui text-sm font-medium leading-3.5 tracking-[-0.15px] text-slate-700" htmlFor="company-address-input">
              Adres
            </label>
            <textarea
              id="company-address-input"
              value={draft.address}
              onChange={(event) => onDraftChange((prev) => ({ ...prev, address: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 font-segoe-ui text-sm tracking-[-0.15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
            />
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="mb-1 block text-[18px] leading-6.75 font-medium text-slate-800">Historia współpracy</h3>
            <p className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-slate-500">Dodaj wydarzenie do historii współpracy z firmą</p>

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 font-segoe-ui text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Dodaj wydarzenie do historii</span>
            </button>
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

export default CompanyEditModal;