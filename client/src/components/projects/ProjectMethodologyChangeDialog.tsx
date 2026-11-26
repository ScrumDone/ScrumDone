import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type ProjectMethodology = 'kanban' | 'scrum';

type ProjectMethodologyChangeDialogProps = {
  isOpen: boolean;
  nextMode: ProjectMethodology | null;
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

const modeLabel = (mode: ProjectMethodology) => (mode === 'scrum' ? 'Scrum' : 'Kanban');

const modeConsequences: Record<ProjectMethodology, string[]> = {
  scrum: [
    'Otworzy się widok sprintów, a tablica pokaże zadania wybranego sprintu.',
    'Zespół planuje pracę w sprintach.',
  ],
  kanban: [
    'Widok sprintów zostanie ukryty.',
    'Zespół wraca do jednej tablicy.',
  ],
};

const ProjectMethodologyChangeDialog: React.FC<ProjectMethodologyChangeDialogProps> = ({
  isOpen,
  nextMode,
  isSaving = false,
  errorMessage = null,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !nextMode) return null;

  const currentMode: ProjectMethodology = nextMode === 'scrum' ? 'kanban' : 'scrum';
  const nextLabel = modeLabel(nextMode);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/35 px-4"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="w-full max-w-[520px] rounded-lg border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-change-title"
        aria-describedby="methodology-change-message"
      >
        <div className="flex items-start justify-between px-6 pb-2 pt-8">
          <h2
            id="methodology-change-title"
            className="font-segoe-ui text-[18px] font-semibold tracking-[-0.44px] text-slate-900"
          >
            Zmiana metodyki projektu
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
            aria-label="Zamknij okno zmiany metodyki"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-4">
          <div className="rounded-lg bg-slate-50 px-5 py-5">
            <p
              id="methodology-change-message"
              className="font-segoe-ui text-[22px] font-medium leading-7 tracking-[-0.4px] text-slate-900"
            >
              Metodyka zmieni się dla całego projektu.
            </p>
            <p className="mt-2 font-segoe-ui text-sm leading-5 text-slate-600">
              Każdy członek zobaczy nowy tryb od razu. Tryb jest wspólny dla wszystkich osób w projekcie.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-segoe-ui text-sm text-slate-500">
              {modeLabel(currentMode)}
            </span>
            <span className="font-segoe-ui text-sm text-slate-400" aria-hidden="true">
              →
            </span>
            <span className="rounded-lg bg-scrumdone-blue-main px-3 py-1.5 font-segoe-ui text-sm font-medium text-white">
              {nextLabel}
            </span>
          </div>

          <ul className="list-disc space-y-2 pl-5">
            {modeConsequences[nextMode].map((line) => (
              <li key={line} className="font-segoe-ui text-sm leading-5 text-slate-700">
                {line}
              </li>
            ))}
            <li className="font-segoe-ui text-sm leading-5 text-slate-700">
              Zadania zostają w projekcie.
            </li>
          </ul>

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-segoe-ui text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
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
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD] disabled:opacity-50"
          >
            {isSaving ? 'Zmienianie…' : `Zmień na ${nextLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectMethodologyChangeDialog;
