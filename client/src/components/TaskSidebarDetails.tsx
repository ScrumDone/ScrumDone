import { 
  ChevronDownIcon, 
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { TaskStatusDropdown } from './TaskStatusDropdown';
import type { Assignment } from '../types/assignment';
import { updateAssignees } from '../api/assignments';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TaskSidebarDetailsProps {
  assignmentId: string;
  assignment: Assignment;
}

export const TaskSidebarDetails: React.FC<TaskSidebarDetailsProps> = ({ assignmentId, assignment }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (assigneeIds: string[]) => updateAssignees(assignmentId, { assigneeIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
    },
  });

  // TODO: Podpiąć wywołanie mutation.mutate(noewAssigneeIds) pod UI

  return (
    <div className="flex flex-col gap-4">
        {/* Dropdown statusu */}
        <TaskStatusDropdown />

        {/* Kafelek szczegółów */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
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
                <DetailRow
                    label="Osoba"
                    value={assignment.assignees?.[0]?.name ?? "Brak"}
                />
                <DetailRow label="Projekt" value={assignment.projectName} />
                <DetailRow label="Utworzono" value={new Date(assignment.createdAt).toLocaleDateString()} />
                <DetailRow label="Termin" value={assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "Brak"} />
                <DetailRow label="Czas estimacji" value={assignment.timeEstimate} isPlaceholder={!assignment.timeEstimate} />
                <DetailRow label="Priorytet" value={assignment.priority.name} />
                <DetailRow label="Wykonaj po" value="Brak danych" isPlaceholder />
            </div>
        </div>
    </div>
  );
};

const DetailRow = ({ label, value, isPlaceholder }: { label: string, value: string, isPlaceholder?: boolean }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500 shrink-0">{label}</span>
        <span className={`font-medium text-right ${isPlaceholder ? "text-slate-400" : "text-slate-800"}`}>
            {value}
        </span>
    </div>
);