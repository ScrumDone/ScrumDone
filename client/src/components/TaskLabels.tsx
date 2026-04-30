import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export const TaskLabels = () => {
  const labels = []; // Tutaj możesz dodać etykiety, np. ['Frontend', 'Bug']

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
          <h2 className="text-[17px] font-bold text-black">Etykiety</h2>
        </div>
        
        <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 hover:text-black">
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="pl-7">
        {labels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <span key={label} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {label}
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