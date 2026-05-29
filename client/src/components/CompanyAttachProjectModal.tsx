import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { ProjectData } from '../data/projects';

type CompanyAttachProjectModalProps = {
  isOpen: boolean;
  companyName: string;
  availableProjects: ProjectData[];
  selectedProjectId: number | null;
  onClose: () => void;
  onSave: () => void;
  onProjectSelect: (projectId: number) => void;
};

const CompanyAttachProjectModal: React.FC<CompanyAttachProjectModalProps> = ({
  isOpen,
  companyName,
  availableProjects,
  selectedProjectId,
  onClose,
  onSave,
  onProjectSelect,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProject = useMemo(
    () => availableProjects.find((project) => project.id === selectedProjectId) ?? null,
    [availableProjects, selectedProjectId],
  );

  const selectedProjectLabel = selectedProject?.name ?? 'Wybierz projekt';

  useEffect(() => {
    if (!isOpen) {
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  if (!isOpen) {
    return null;
  }

  const handleProjectSelect = (projectId: number) => {
    onProjectSelect(projectId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div
        className="flex w-full max-w-130 flex-col gap-4 overflow-visible rounded-[10px] border border-slate-200 bg-white px-6 pb-6 pt-8 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4">
          <div>
            <h2 className="mb-1 text-[18px] font-semibold tracking-[-0.44px] text-slate-900">Podepnij projekt</h2>
            <p className="text-sm leading-5 tracking-[-0.15px] text-slate-500">
              Wybierz projekt, który chcesz podpiąć do firmy {companyName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zamknij okno podpinania projektu"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className={`overflow-visible ${isDropdownOpen ? 'relative z-30' : ''}`}>
          <label className="mb-2 block text-sm font-medium leading-5 text-slate-900" htmlFor="company-attach-project-trigger">
            Projekt
          </label>
          <div className="relative z-20" ref={dropdownRef}>
            <button
              id="company-attach-project-trigger"
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg bg-[#F3F3F5] px-3 py-2 text-left text-sm tracking-[-0.15px] outline-none transition-colors focus:ring-1 focus:ring-scrumdone-blue-main"
            >
              <span className={selectedProject ? 'text-slate-700' : 'text-slate-400'}>{selectedProjectLabel}</span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen ? (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-1 shadow-md">
                {availableProjects.length > 0 ? (
                  availableProjects.map((project) => {
                    const isSelected = project.id === selectedProjectId;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => handleProjectSelect(project.id)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm tracking-[-0.15px] transition-colors ${
                          isSelected ? 'bg-[#F3F3F5] text-slate-900' : 'text-slate-700 hover:bg-[#F3F3F5]'
                        }`}
                      >
                        <span>{project.name}</span>
                        {isSelected ? <CheckIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" /> : null}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-1.5 text-sm text-slate-500">Brak projektów do podpięcia</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-end gap-3 pt-4">
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
            disabled={!selectedProjectId}
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-scrumdone-blue-main"
          >
            Podepnij
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyAttachProjectModal;
