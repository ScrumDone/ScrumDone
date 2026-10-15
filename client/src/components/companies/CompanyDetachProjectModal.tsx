import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { companyModalOverlayClass, companyModalPanelClass } from './companyModalClasses';

type CompanyDetachProjectModalProps = {
  isOpen: boolean;
  projectName: string;
  companyName: string;
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

const CompanyDetachProjectModal: React.FC<CompanyDetachProjectModalProps> = ({
  isOpen,
  projectName,
  companyName,
  isSaving = false,
  errorMessage = null,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`${companyModalOverlayClass} z-50`} onClick={onClose}>
      <div
        className={`${companyModalPanelClass} gap-4 px-6 pb-6 pt-8`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4">
          <div>
            <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Odepnij projekt</h2>
            <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">
              Czy na pewno chcesz odpiąć projekt {projectName} od firmy {companyName}? Projekt nie zostanie usunięty
              i będzie można go ponownie podpiąć.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno odpinania projektu"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          {errorMessage ? <p className="mr-auto text-sm text-red-600">{errorMessage}</p> : null}
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="rounded-lg bg-red-600 px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
          >
            {isSaving ? 'Odpinanie…' : 'Odepnij'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetachProjectModal;
