import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { AssignmentLabel } from '../types/assignment';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { updateLabels } from '../api/assignments';


interface TaskLabelsProps {
  assignmentId: string;
  labels: AssignmentLabel[];
}

export const TaskLabels: React.FC<TaskLabelsProps> = ({ assignmentId, labels }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (labelIds: string[]) => updateLabels(assignmentId, { labelIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
    },
  });

  //Dodana funkcja usuwania etykiety po kliknięciu
  const handleRemoveLabel = (labelIdToRemove: string) => {
    const currentLabelIds = labels.map(l => l.id);
    const newLabelIds = currentLabelIds.filter(id => id !== labelIdToRemove);
    mutation.mutate(newLabelIds);
  };
  
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          {/* items-baseline wyrównuje dół tekstu, relative koryguje ikonę optycznie */}
          <div className="relative top-[5px]">
            <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
          </div>
          
          <h2 className="text-[20px] leading-[30px] font-medium text-black">
            Etykiety
          </h2>
        </div>
        
        <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 hover:text-black">
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
      </div>

      <div>
        {labels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <span key={label.id} onClick={() => handleRemoveLabel(label.id)} className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {label.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[14px] text-slate-400">Brak</span>
        )}
      </div>
    </section>
  );
};