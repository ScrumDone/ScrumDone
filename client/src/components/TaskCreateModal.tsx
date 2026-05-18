import React from 'react';
import { XMarkIcon, MagnifyingGlassIcon, PaperClipIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import { type PersonFilter } from './calendarPeopleFilter';

type TaskCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: PersonFilter[];
};

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ isOpen, onClose, teamMembers }) => {
  if (!isOpen) return null;

  // Mockowe dane dla sprintów
  const mockSprints = [
    { id: 's1', name: 'Sprint 1 - Core Features' },
    { id: 's2', name: 'Sprint 2 - Testing & QA' },
    { id: 's3', name: 'Sprint 3 - Deployment' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 font-segoe-ui">
      <div 
        className="relative flex h-full max-h-[850px] w-full max-w-[560px] flex-col overflow-hidden rounded-[12px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-6">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900">Nowe zadanie</h2>
            <p className="text-[14px] text-slate-500">Utwórz nowe zadanie w projekcie</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar">
          {/* Tytuł */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Tytuł zadania</label>
            <input
              type="text"
              placeholder="Wpisz tytuł zadania"
              className="w-full rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] placeholder:text-slate-400 focus:ring-2 focus:ring-scrumdone-blue-main outline-none"
            />
          </div>

          {/* Opis */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Opis (opcjonalnie)</label>
            <textarea
              placeholder="Wpisz opis zadania"
              rows={3}
              className="w-full resize-none rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] placeholder:text-slate-400 focus:ring-2 focus:ring-scrumdone-blue-main outline-none"
            />
          </div>

          {/* Przypisani użytkownicy */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Przypisani użytkownicy</label>
            <div className="rounded-[8px] border border-slate-200 p-1">
              <div className="relative mb-2">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj osoby..."
                  className="w-full rounded-[6px] bg-[#F5F6F8] py-2 pl-9 pr-4 text-[13px] outline-none"
                />
              </div>
              <div className="max-h-36 overflow-y-auto px-2 space-y-1">
                {teamMembers.map((member) => (
                  <label key={member.id} className="flex cursor-pointer items-center gap-3 rounded-md py-1.5 hover:bg-slate-50">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-scrumdone-blue-main focus:ring-scrumdone-blue-main" />
                    <Avatar initials={member.initials} size="xs" bgClassName="bg-[#00BFFF]" textClassName="text-white" />
                    <span className="text-[14px] text-slate-700">{member.fullName}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Status i Priorytet */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-slate-900">Status</label>
              <div className="relative">
                <select className="w-full appearance-none rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main">
                  <option>Do zrobienia</option>
                  <option>W trakcie</option>
                  <option>Przegląd</option>
                  <option>Ukończone</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-slate-900">Priorytet</label>
              <div className="relative">
                <select className="w-full appearance-none rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main">
                  <option>Niski</option>
                  <option>Średni</option>
                  <option>Wysoki</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Deadline z walidacją i kalendarzem jak na obraz_2.png */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Deadline (opcjonalnie)</label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main block custom-date-input"
              />
              {/* Notka: input[type="date"] sam wstawia ikonkę kalendarza z prawej strony i obsługuje dd.mm.rrrr */}
            </div>
          </div>

          {/* Załączniki */}
          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Załączniki (opcjonalnie)</label>
            <div className="flex flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-slate-200 bg-white py-6">
              <PaperClipIcon className="mb-2 h-6 w-6 text-slate-400 rotate-45" />
              <p className="text-[13px] text-slate-600">Kliknij lub przeciągnij pliki tutaj</p>
              <p className="text-[11px] text-slate-400 text-center px-4">Maksymalny rozmiar: 25 MB</p>
            </div>
          </div>

          {/* Sprint z mockowymi danymi */}
          <div className="pb-4">
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Sprint (opcjonalnie)</label>
            <div className="relative">
              <select className="w-full appearance-none rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] text-slate-700 outline-none focus:ring-2 focus:ring-scrumdone-blue-main">
                <option value="">Wybierz sprint</option>
                {mockSprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-4 bg-white">
          <button 
            onClick={onClose}
            className="rounded-[8px] border border-slate-200 px-5 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Anuluj
          </button>
          <button className="rounded-[8px] bg-scrumdone-blue-main px-5 py-2 text-[14px] font-medium text-white hover:bg-[#00A0DD]">
            Utwórz zadanie
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreateModal;