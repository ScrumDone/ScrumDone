import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export type Sprint = {
  id: string;
  title: string;
  dateRange: string;
  totalTasks: number;
  completedTasks: number;
  status: 'Aktywny' | 'Ukończony' | 'Planowany';
};

interface SprintSelectorProps {
  sprints: Sprint[];
  currentSprintId: string;
  onSprintChange: (sprintId: string) => void;
}

const SprintSelector: React.FC<SprintSelectorProps> = ({ sprints, currentSprintId, onSprintChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentSprint = sprints.find((s) => s.id === currentSprintId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSprintSelect = (sprintId: string) => {
    onSprintChange(sprintId);
    setIsOpen(false);
  };

  const completionPercentage = currentSprint
    ? Math.round((currentSprint.completedTasks / currentSprint.totalTasks) * 100)
    : 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex max-w-full items-center gap-4 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scrumdone-blue-main/30"
        aria-label={currentSprint?.title}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 mr-4">
          <h2 className="font-segoe-ui text-sm leading-5 font-medium text-center tracking-[-0.15px] text-slate-900 antialiased">
            {currentSprint?.title}
          </h2>

          <div className="mt-0.5 flex flex-wrap items-center gap-3 font-segoe-ui text-[12px] leading-4 font-medium text-slate-700 antialiased">
            <span>{currentSprint?.dateRange}</span>
            <span>•</span>
            <span>{currentSprint?.totalTasks} zadań</span>
            <span>•</span>
            <span className="text-scrumdone-green-500 font-medium">
              {currentSprint?.completedTasks} ukończonych ({completionPercentage}%)
            </span>
          </div>
        </div>

        <div className="inline-flex shrink-0 items-center gap-3 self-center">
          <span className={`inline-flex items-center rounded-lg border border-slate-300 px-2 py-0.5 font-segoe-ui text-[12px] leading-4 font-medium ${currentSprint?.status === 'Aktywny' ? 'bg-scrumdone-blue-main text-white' : 'text-slate-900 bg-slate-50'}`}>
            {currentSprint?.status}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 z-50 mt-2 rounded-lg border border-slate-200 bg-white shadow-xl"
          role="listbox"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-segoe-ui text-[14px] leading-5 font-medium text-slate-900 antialiased">Wszystkie zadania</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {sprints.map((sprint) => {
              const sprintCompletionPercentage = Math.round((sprint.completedTasks / sprint.totalTasks) * 100);
              const isSelected = sprint.id === currentSprintId;

              return (
                <button
                  key={sprint.id}
                  type="button"
                  onClick={() => handleSprintSelect(sprint.id)}
                  className={`group w-full px-4 py-3 text-left transition-colors hover:bg-slate-50`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-segoe-ui text-[14px] leading-5 font-medium text-slate-900 antialiased">
                        {sprint.title}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 font-segoe-ui text-[12px] leading-4 font-medium text-slate-600 antialiased">
                        <span>{sprint.dateRange}</span>
                        <span>•</span>
                        <span>{sprint.totalTasks} zadań</span>
                        <span>•</span>
                        <span className="text-scrumdone-green-500">{sprint.completedTasks} ukończonych ({sprintCompletionPercentage}%)</span>
                      </div>
                    </div>

                    <div className="inline-flex shrink-0 items-center gap-2">
                      <span className={`inline-flex items-center rounded-lg border border-slate-300 px-2 py-0.5 font-segoe-ui text-[12px] leading-4 font-medium ${sprint.status === 'Aktywny' ? 'bg-scrumdone-blue-main text-white' : 'text-slate-900 bg-slate-50'}`}>
                        {sprint.status}
                      </span>

                      {isSelected && (
                          <CheckIcon className="h-4 w-4 text-slate-900 stroke-2" />

                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintSelector;
