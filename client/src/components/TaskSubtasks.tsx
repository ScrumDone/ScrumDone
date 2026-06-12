import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { Assignment } from '../types/assignment';

interface TaskSubtasksProps {
  assignment: Assignment; 
}

//Assignment jest, ale nieużyte, bo nie wiem gdzie w ui to jest

export const TaskSubtasks: React.FC<TaskSubtasksProps> = ({ assignment: _assignment }) => (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    
    {/* Nagłówek kafelka */}
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        {/* Twoja sprawdzona korekta: items-baseline + relative top-[5px] */}
        <div className="relative top-[5px]">
          <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
        </div>
        
        <h2 className="text-[20px] leading-[30px] font-medium text-black">
          Zadania podrzędne
        </h2>
      </div>

      <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 hover:text-black">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>
    </div>

    <div>
      <button className="text-[13px] text-slate-500 font-medium hover:text-black transition-colors cursor-pointer">
        Dodaj zadanie podrzędne
      </button>
    </div>
  </section>
);