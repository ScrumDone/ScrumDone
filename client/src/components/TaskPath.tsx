import { ChevronDownIcon, CalendarIcon, TableCellsIcon } from '@heroicons/react/24/outline';

export const TaskPath = () => (
  <div className="rounded-lg border border-slate-200 p-4">
    <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
      <ChevronDownIcon className="h-4 w-4 text-black" />
      <span>Ścieżka</span>
    </div>
    
    <div className="space-y-3 pl-6 font-bold">
      <button className="flex items-center gap-2 text-sm text-scrumdone-blue-600 hover:underline">
        <CalendarIcon className="h-4 w-4" />
        <span>Pokaż w kalendarzu</span>
      </button>
      <button className="flex items-center gap-2 text-sm text-scrumdone-blue-600 hover:underline">
        <TableCellsIcon className="h-4 w-4" />
        <span>Pokaż w tablicy kanban projektu</span>
      </button>
    </div>
  </div>
);