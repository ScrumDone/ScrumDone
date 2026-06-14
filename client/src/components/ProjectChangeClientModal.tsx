import React, { useEffect, useMemo, useState } from 'react';
import {
  BuildingOffice2Icon,
  CheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { CompanyListItem } from '../types/company';

type ProjectChangeClientModalProps = {
  isOpen: boolean;
  companies: CompanyListItem[];
  currentCompanyId: string | null;
  onClose: () => void;
  onSave: (companyId: string) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

const ProjectChangeClientModal: React.FC<ProjectChangeClientModalProps> = ({
  isOpen,
  companies,
  currentCompanyId,
  onClose,
  onSave,
  isSaving = false,
  errorMessage = null,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(currentCompanyId);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSearchValue('');
    setSelectedCompanyId(currentCompanyId);
  }, [isOpen, currentCompanyId]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLocaleLowerCase('pl-PL');

    if (!normalizedSearch) {
      return companies;
    }

    return companies.filter((company) =>
      company.name.toLocaleLowerCase('pl-PL').includes(normalizedSearch),
    );
  }, [companies, searchValue]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (!selectedCompanyId) {
      return;
    }

    onSave(selectedCompanyId);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-8">
          <div>
            <h2 className="font-segoe-ui text-[18px] font-semibold leading-7 tracking-[-0.44px] text-slate-900">
              Zmień klienta projektu
            </h2>
            <p className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-slate-500">
              Wybierz firmę, która będzie przypisana do tego projektu.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
            aria-label="Zamknij okno zmiany klienta"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-5">
          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Szukaj firmy..."
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 font-segoe-ui text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main disabled:opacity-60"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="max-h-72 overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">Brak firm pasujących do wyszukiwania.</p>
              ) : (
                filteredCompanies.map((company) => {
                  const isSelected = selectedCompanyId === company.id;

                  return (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => setSelectedCompanyId(company.id)}
                      disabled={isSaving}
                      className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 disabled:opacity-60 ${
                        isSelected ? 'bg-scrumdone-blue-200/40' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <BuildingOffice2Icon
                        className={`h-4 w-4 shrink-0 ${isSelected ? 'text-scrumdone-blue-main' : 'text-slate-500'}`}
                      />
                      <span
                        className={`min-w-0 flex-1 font-segoe-ui text-sm font-medium tracking-[-0.15px] ${
                          isSelected ? 'text-scrumdone-blue-main' : 'text-slate-900'
                        }`}
                      >
                        {company.name}
                      </span>
                      {isSelected ? (
                        <CheckIcon className="h-4 w-4 shrink-0 text-scrumdone-blue-main stroke-2" />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedCompanyId || selectedCompanyId === currentCompanyId}
            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD] disabled:opacity-50"
          >
            {isSaving ? 'Zapisywanie…' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChangeClientModal;
