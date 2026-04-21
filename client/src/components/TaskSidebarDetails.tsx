import { 
  ChevronDownIcon, 
  AdjustmentsVerticalIcon // Import ikony ustawień
} from '@heroicons/react/24/outline';
import { TaskStatusDropdown } from './TaskStatusDropdown';

export const TaskSidebarDetails = () => (
    <div className="flex flex-col gap-4">
        <TaskStatusDropdown />

        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between font-bold">
                <div className="flex items-center gap-2 text-sm">
                    <ChevronDownIcon className="h-4 w-4 text-black stroke-[2.5]" /> 
                    <span className="text-black">Szczegóły</span>
                </div>
                
                <button className="group p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer">
                    <AdjustmentsVerticalIcon className="h-4 w-4 text-black group-hover:text-black transition-colors" />
                </button>
            </div>
            
            <div className="space-y-4 text-sm">
                <DetailRow label="Osoba przypisana" value="Aleksander Radecki" hasAvatar />
                <DetailRow label="Osoba zgłaszająca" value="Aleksander Radecki" hasAvatar />
                <DetailRow label="Etykiety" value="Brak" isPlaceholder />
                <DetailRow label="Termin" value="Brak" isPlaceholder />
                <DetailRow label="Data początkowa" value="Brak" isPlaceholder />
                <DetailRow label="Priorytet" value="Brak" isPlaceholder />
            </div>
            
            <button className="mt-4 text-xs text-slate-500 hover:underline cursor-pointer">
                Jeszcze 7 pól
            </button>
        </div>
    </div>
);

const DetailRow = ({ label, value, hasAvatar, isPlaceholder }: any) => (
    <div className="grid grid-cols-2 items-center">
        <span className="text-slate-500 font-bold">{label}</span>
        <div className="flex items-center gap-2">
            {hasAvatar && (
                <div className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${value}&background=random`} 
                        alt="avatar" 
                        className="h-full w-full object-cover"
                    />
                </div>
            )}
            <span className={`font-medium ${isPlaceholder ? "text-black font-medium" : "text-black"}`}>
                {value}
            </span>
        </div>
    </div>
);