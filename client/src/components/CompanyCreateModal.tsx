import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { CompanyEditDraft } from './CompanyEditModal';

type CompanyCreateModalProps = {
  isOpen: boolean;
  draft: CompanyEditDraft;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: React.Dispatch<React.SetStateAction<CompanyEditDraft>>;
  isSaving?: boolean;
  errorMessage?: string | null;
};

const inputClassName =
  'w-full rounded-[10px] border border-[#E8EAED] bg-[#F5F6F8] px-3 py-2 font-segoe-ui text-sm tracking-[-0.15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main';

const CompanyCreateModal: React.FC<CompanyCreateModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
  onDraftChange,
  isSaving = false,
  errorMessage = null,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof CompanyEditDraft, value: string) => {
    onDraftChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div
        className="box-border flex h-[402px] w-[600px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between px-6 pb-2 pt-4">
          <div>
            <h2 className="mb-0.5 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Nowa firma</h2>
            <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">Dodaj nową firmę do systemu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-0.5 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <XMarkIcon className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-0 pt-6">
          <div>
            <label className="mb-1.5 block font-segoe-ui text-sm font-medium text-slate-700" htmlFor="name">
              Nazwa firmy
            </label>
            <input
              id="name"
              type="text"
              value={draft.name}
              placeholder="Wpisz nazwę firmy"
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block font-segoe-ui text-sm font-medium text-slate-700" htmlFor="nip">
                NIP
              </label>
              <input
                id="nip"
                type="text"
                value={draft.nip}
                placeholder="0000000000"
                onChange={(e) => handleChange('nip', e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-segoe-ui text-sm font-medium text-slate-700" htmlFor="krs">
                KRS
              </label>
              <input
                id="krs"
                type="text"
                value={draft.krs}
                placeholder="0000000000"
                onChange={(e) => handleChange('krs', e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-segoe-ui text-sm font-medium text-slate-700" htmlFor="regon">
                REGON
              </label>
              <input
                id="regon"
                type="text"
                value={draft.regon}
                placeholder="000000000"
                onChange={(e) => handleChange('regon', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-segoe-ui text-sm font-medium text-slate-700" htmlFor="address">
              Adres
            </label>
            <textarea
              id="address"
              value={draft.address}
              placeholder="ul. Przykładowa 1, 00-000 Warszawa"
              onChange={(e) => handleChange('address', e.target.value)}
              rows={1}
              className="box-border h-[36px] min-h-[36px] max-h-[36px] w-full resize-none overflow-y-auto rounded-[10px] border border-[#E8EAED] bg-[#F5F6F8] px-3 py-[7px] font-segoe-ui text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-4 px-6 pb-4 pt-4">
          {errorMessage && (
            <p className="mr-auto text-sm text-red-600">{errorMessage}</p>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[10px] border border-[#E0E0E0] bg-white px-6 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-[10px] bg-[#00BFFF] px-6 py-2.5 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
          >
            {isSaving ? 'Dodawanie…' : 'Dodaj firmę'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreateModal;