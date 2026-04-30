import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export const TaskAttachments = () => (
  <section className="rounded-xl border border-slate-200 bg-white p-5">
    {/* Nagłówek kafelka */}
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
        <h2 className="text-[24px] font-medium text-black">Załączniki</h2>
        <span className="text-[15px] text-slate-400 font-medium">(2)</span>
      </div>
      <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer">
        <EllipsisVerticalIcon className="h-5 w-5 text-black" />
      </button>
    </div>

    <div className="flex gap-6">
      <AttachmentCard 
        name="design-mockup.png" 
        date="03.04.2026" 
        imgSrc="/image17.png" 
      />
      <AttachmentCard 
        name="wireframe.jpg" 
        date="02.04.2026" 
        imgSrc="/image17.png" 
      />
    </div>
  </section>
);

const AttachmentCard = ({ name, date, imgSrc }: { name: string; date: string; imgSrc: string }) => (
  <div className="group w-24 cursor-pointer">
    {/* Miniaturka */}
    <div className="mb-2 h-24 w-24 overflow-hidden rounded-lg bg-slate-100">
      <img 
        src={imgSrc} 
        alt={name} 
        className="h-full w-full object-cover transition-transform group-hover:scale-105" 
      />
    </div>
    <div className="space-y-0.5">
      <p className="truncate text-[11px] font-medium text-slate-500">{name}</p>
      <p className="text-[11px] text-slate-400">{date}</p>
    </div>
  </div>
);