import { ChevronDownIcon, EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/outline';

export const TaskRelatedIssues = () => (
  <section className="mt-8">
    <div className="mb-3 flex items-center justify-between font-bold text-slate-900">
      <div className="flex items-center gap-2">
        <ChevronDownIcon className="h-4 w-4 text-black" />
        <span className="text-sm">Powiązane zgłoszenia</span>
      </div>
      <div className="flex gap-2 text-slate-400">
        <EllipsisHorizontalIcon className="h-4 w-4 cursor-pointer hover:text-slate-600 text-black" />
        <PlusIcon className="h-4 w-4 cursor-pointer hover:text-slate-600 text-black" />
      </div>
    </div>
    <button className="pl-6 text-sm text-black hover:underline">Dodaj powiązane zgłoszenie</button>
  </section>
);