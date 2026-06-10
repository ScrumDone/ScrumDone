import React, { useEffect, useRef, useState } from 'react';
import {
  XMarkIcon,
  ChevronDownIcon,
  ArrowUpTrayIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { companies } from '../data/companies'; 
import { projects } from '../data/projects';   

export type FileDraft = {
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  tags: string[];
  isPublic: boolean;
};

type FileAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: FileDraft) => void; 
};

const AVAILABLE_TAGS = [
  'QA', 'RODO', 'UI', 'UX', 'backup', 'bezpieczeństwo', 'branding', 'bug',
  'database', 'design', 'dokumentacja', 'faktura', 'finanse', 'grafika',
  'harmonogram', 'klient', 'kontrakt', 'logo', 'mobile', 'mockup', 'plan',
  'polityka', 'prawne', 'prezentacja', 'screenshot', 'specyfikacja', 'sprzedaż',
  'szablon', 'techniczne', 'umowa', 'wireframe', 'wytyczne', 'zarządzanie'
];

const FileAddModal: React.FC<FileAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [draft, setDraft] = useState<FileDraft>({
    name: '',
    description: '',
    clientId: '',
    clientName: '',
    projectId: '',
    projectName: '',
    tags: [],
    isPublic: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(target)) {
        setIsClientDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(target)) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isClientDropdownOpen || isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClientDropdownOpen, isProjectDropdownOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!draft.name) {
        setDraft(prev => ({ ...prev, name: file.name }));
      }
    }
  };

  const handleToggleTag = (tag: string) => {
    setDraft(prev => {
      const isSelected = prev.tags.includes(tag);
      return {
        ...prev,
        tags: isSelected ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const handleSave = () => {
    onSave(draft);
    setDraft({ name: '', description: '', clientId: '', clientName: '', projectId: '', projectName: '', tags: [], isPublic: true });
    setSelectedFile(null);
  };

  const sharedFieldClassName = 'w-full rounded-lg border border-slate-100 bg-slate-100 px-3 py-2 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main';
  const dropdownButtonClassName = 'flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-100 px-3 py-2 text-left text-[15px] outline-none transition-colors hover:border-slate-200 focus:border-scrumdone-blue-main';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-160 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Nagłówek */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="font-segoe-ui text-[20px] font-semibold text-slate-900">Nowy plik</h2>
            <p className="text-sm text-slate-500">Dodaj nowy plik do systemu</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Zamknij">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Zawartość scrollowana */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 custom-scrollbar">
          
          {/* Strefa Drop/Upload pliku */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Plik</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <ArrowUpTrayIcon className="h-6 w-6 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">
                {selectedFile ? `Wybrany plik: ${selectedFile.name}` : 'Kliknij lub przeciągnij plik tutaj'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Maksymalny rozmiar: 25 MB</p>
            </div>
          </div>

          {/* Nazwa pliku */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nazwa pliku</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Wpisz nazwę pliku"
              className={sharedFieldClassName}
            />
          </div>

          {/* Opis */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Opis (opcjonalnie)</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Wpisz opis pliku"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-100 bg-slate-100 px-3 py-2 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-scrumdone-blue-main"
            />
          </div>

          {/* Wybór Klienta */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Klient (opcjonalnie)</label>
            <div className="relative" ref={clientDropdownRef}>
              <button
                type="button"
                onClick={() => setIsClientDropdownOpen(prev => !prev)}
                className={dropdownButtonClassName}
              >
                <span className={draft.clientName ? 'text-slate-900' : 'text-slate-400'}>
                  {draft.clientName || 'Wybierz klienta'}
                </span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isClientDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-md max-h-48 overflow-y-auto">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => {
                        setDraft(prev => ({ ...prev, clientId: String(company.id), clientName: company.name }));
                        setIsClientDropdownOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wybór Projektu */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Projekt (opcjonalnie)</label>
            <div className="relative" ref={projectDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProjectDropdownOpen(prev => !prev)}
                className={dropdownButtonClassName}
              >
                <span className={draft.projectName ? 'text-slate-900' : 'text-slate-400'}>
                  {draft.projectName || 'Wybierz projekt'}
                </span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProjectDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-md max-h-48 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setDraft(prev => ({ ...prev, projectId: String(project.id), projectName: project.name }));
                        setIsProjectDropdownOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sekcja Tagów */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tagi</label>
            <div className="flex flex-wrap gap-2 rounded-xl bg-white p-1">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = draft.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-scrumdone-blue-main text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Widoczność</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDraft(prev => ({ ...prev, isPublic: true }))}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all border ${
                  draft.isPublic
                    ? 'bg-scrumdone-blue-main border-scrumdone-blue-main text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GlobeAltIcon className="h-4 w-4" />
                Publiczny
              </button>
              <button
                type="button"
                onClick={() => setDraft(prev => ({ ...prev, isPublic: false }))}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all border ${
                  !draft.isPublic
                    ? 'bg-scrumdone-blue-main border-scrumdone-blue-main text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LockClosedIcon className="h-4 w-4" />
                Prywatny
              </button>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-scrumdone-blue-main hover:bg-[#00A0DD] px-5 py-2 text-sm font-medium text-white shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Dodaj plik
          </button>
        </div>

      </div>
    </div>
  );
};

export default FileAddModal;