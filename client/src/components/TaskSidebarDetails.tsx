import { 
  ChevronDownIcon, 
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { TaskStatusDropdown } from './TaskStatusDropdown';

export const TaskSidebarDetails = () => (
    <div className="flex flex-col gap-4">
        {/* Dropdown statusu */}
        <TaskStatusDropdown />

        {/* Kafelek szczegółów */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    {/* Twoja sprawdzona korekta: items-baseline + relative top-[5px] */}
                    <div className="relative top-[5px]">
                        <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" /> 
                    </div>
                    
                    <h2 className="text-[20px] leading-[30px] font-medium text-black">
                        Szczegóły
                    </h2>
                </div>
                
                <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 hover:text-black">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
            </div>
            
            {/* Lista pól */}
            <div className="space-y-4 text-[14px]">
                <DetailRow label="Osoba" value="Artur Nowak" />
                <DetailRow label="Projekt" value="Adoddle" />
                <DetailRow label="Utworzono" value="25.03.2026" />
                <DetailRow label="Termin" value="7.04.2026" />
                <DetailRow label="Czas estimacji" value="Brak" isPlaceholder />
                <DetailRow label="Priorytet" value="Wysoki" />
                <DetailRow label="Wykonaj po" value="Brak" isPlaceholder />
            </div>
        </div>
    </div>
);

const DetailRow = ({ label, value, isPlaceholder }: { label: string, value: string, isPlaceholder?: boolean }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500 shrink-0">{label}</span>
        <span className={`font-medium text-right ${isPlaceholder ? "text-slate-800" : "text-slate-800"}`}>
            {value}
        </span>
    </div>
);