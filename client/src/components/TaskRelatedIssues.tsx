import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export const TaskRelatedIssues = () => (
  <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
    
    {/* Nagłówek kafelka */}
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
        <h2 className="text-[24px] font-medium text-black">Powiązane zgłoszenia</h2>
      </div>
      <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 hover:text-black">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>
    </div>

    <div>
      <button className="text-[13px] text-slate-500 font-medium hover:text-black transition-colors">
        Dodaj powiązane zgłoszenie
      </button>
    </div>
  </section>
);