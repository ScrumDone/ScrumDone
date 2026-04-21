import { ChevronDownIcon, EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/outline';

export const TaskAttachments = () => (
  <section className="mt-8">
    <div className="mb-3 flex items-center justify-between font-semibold text-slate-900">
      <div className="flex items-center gap-2">
        <ChevronDownIcon className="h-4 w-4 text-black" />
        <span className="text-sm font-bold">Załączniki</span>
        <span className="ml-1 rounded bg-slate-200 px-2 py-0.2 text-xs text-slate-900 font-bold">2</span>
      </div>
      <div className="flex gap-2 text-slate-400">
        <EllipsisHorizontalIcon className="h-4 w-4 cursor-pointer hover:text-slate-600 text-black" />
        <PlusIcon className="h-4 w-4 cursor-pointer hover:text-slate-600 text-black" />
      </div>
    </div>
    <div className="flex gap-4 pl-6">
      <AttachmentCard name="Zdjęcie gór zrobion...zdj.1.pdf" date="09 mar 2026, 05:15 AM" />
      <AttachmentCard name="Zdjęcie gór zrobion...zdj.2.pdf" date="09 mar 2026, 05:15 AM" />
    </div>
  </section>
);

const AttachmentCard = ({ name, date }: { name: string; date: string }) => (
  <div className="w-[180px] cursor-pointer rounded-lg border border-slate-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-2 h-20 w-full overflow-hidden rounded bg-slate-100">
      <img src="/image17.png" alt="Preview" className="h-full w-full object-cover" />
    </div>
    <p className="truncate text-[10px] font-bold text-black">{name}</p>
    <p className="text-[8px] text-black font-medium">{date}</p>
  </div>
);