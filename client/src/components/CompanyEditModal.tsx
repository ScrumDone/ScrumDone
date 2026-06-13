import React, { useState } from 'react';
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
  onDelete: () => void;
  onDraftChange: (updater: (prev: CompanyEditDraft) => CompanyEditDraft) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  isOpen,
  draft,
  onClose,
  onSave,
  onDelete,
  onDraftChange,
  isSaving = false,
  errorMessage = null,
}) => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* GŁÓWNY MODAL EDYCJI */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
        <div
          className="flex max-h-[86vh] w-full max-w-130 flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-6 pb-4 pt-8">
            <div>
              <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Edytuj firmę</h2>
              <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">Zaktualizuj informacje o firmie</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">Nazwa firmy</label>
              <input id="name" type="text" value={draft.name} onChange={(e) => onDraftChange((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm outline-none focus:border-scrumdone-blue-main" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {['nip', 'krs', 'regon'].map((field) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-medium text-slate-700 uppercase">{field}</label>
                  <input type="text" value={draft[field as keyof CompanyEditDraft]} onChange={(e) => onDraftChange((p) => ({ ...p, [field]: e.target.value }))} className="w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm outline-none focus:border-scrumdone-blue-main" />
                </div>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="address">Adres</label>
              <textarea id="address" value={draft.address} onChange={(e) => onDraftChange((p) => ({ ...p, address: e.target.value }))} rows={3} className="w-full resize-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm outline-none focus:border-scrumdone-blue-main" />
            </div>

            <div className="border-t border-slate-200 pt-5">
              <h3 className="mb-1 text-[18px] font-medium text-slate-800">Historia współpracy</h3>
              <p className="text-sm text-slate-500">Dodaj wydarzenie do historii współpracy z firmą</p>
              <button type="button" onClick={() => setIsEventModalOpen(true)} className="mt-4 flex w-full items-center justify-center gap-3 rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">
                <PlusIcon className="h-4 w-4" /> <span>Dodaj wydarzenie do historii</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <button 
              onClick={() => {
                if (window.confirm('Czy na pewno chcesz usunąć tę firmę? Ta akcja jest nieodwracalna.')) {
                  onDelete();
                }
              }} 
              disabled={isSaving}
              className="mr-auto rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"            >
              Usuń firmę
            </button>
            
            {errorMessage && <p className="mr-auto text-sm text-red-600">{errorMessage}</p>}
            <button onClick={onClose} disabled={isSaving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Anuluj</button>
            <button onClick={onSave} disabled={isSaving} className="rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm font-medium text-white hover:bg-[#00A0DD] disabled:opacity-50">
              {isSaving ? 'Zapisywanie…' : 'Zapisz zmiany'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DODAWANIA WYDARZENIA */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 px-4" onClick={() => setIsEventModalOpen(false)}>
          <div className="flex w-full max-w-130 flex-col rounded-[10px] border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-6 pb-4 pt-8">
              <div>
                <h2 className="mb-1 text-[18px] font-semibold text-slate-900">Dodaj wydarzenie do historii</h2>
                <p className="text-sm text-slate-700">Dodaj nowe wydarzenie do historii współpracy z firmą</p>
              </div>
              <button onClick={() => setIsEventModalOpen(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><XMarkIcon className="h-4 w-4" /></button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">Typ wydarzenia</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-100 outline-none focus:border-scrumdone-blue-main">
                  <option>Inne</option>
                  <option>Podpis umowy</option>
                  <option>Spotkanie</option>
                  <option>Start projektu</option>
                  <option>Zakończenie projektu</option>
                  <option>Zmiana adresu</option>
                  <option>Zmiana osoby kontaktowej</option>
                  <option>Wysłano email</option>
                  <option>Rozmowa telefoniczna</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">Tytuł</label>
                <input type="text" placeholder="np. Podpisanie umowy na projekt X" className="w-full rounded-lg bg-slate-100 border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-600 outline-none focus:border-scrumdone-blue-main" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">Opis <span className="text-slate-700">(opcjonalnie)</span></label>
                <textarea rows={3} placeholder="Dodatkowe szczegóły..." className="w-full resize-none bg-slate-100 rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-600 outline-none focus:border-scrumdone-blue-main" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">Data</label>
                <input type="date" className="w-full rounded-lg bg-slate-100 border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-scrumdone-blue-main" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setIsEventModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900">Anuluj</button>
              <button className="rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm font-medium text-white hover:bg-[#00A0DD]">Dodaj wydarzenie</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyEditModal;