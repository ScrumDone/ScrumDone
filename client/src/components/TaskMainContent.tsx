import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export const TaskMainContent = () => (
  <div className="flex flex-col gap-8">
    {/* Główny tytuł zadania poza kafelkiem */}
    <h1 className="text-[24px] font-bold text-black">Quotes Generation module</h1>

    {/* Kafelek Opis */}
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
          <h2 className="text-[17px] font-bold text-black">Opis</h2>
        </div>
        
        {/* Pionowe trzy kropki w prawym górnym rogu */}
        <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer">
          <EllipsisVerticalIcon className="h-5 w-5 text-black" />
        </button>
      </div>

      {/* Kontener z wcięciem pl-7 */}
      <div className="pl-7">
        <div className="text-[15px] text-slate-600 mb-6">
          Implement quotes generation for clients
        </div>

        {/* Galeria zdjęć - kwadratowe miniatury bez obramowania kart */}
        <div className="flex gap-6">
          <AttachmentCard 
            name="screenshot-1.png" 
            date="05.04.2026" 
          />
          <AttachmentCard 
            name="screenshot-2.png" 
            date="05.04.2026" 
          />
        </div>
      </div>
    </section>
  </div>
);

const AttachmentCard = ({ name, date }: { name: string; date: string }) => (
  <div className="group w-24 cursor-pointer">
    {/* Miniaturka - zaokrąglony kwadrat zgodny ze screenem */}
    <div className="mb-2 h-24 w-24 overflow-hidden rounded-lg bg-slate-100">
      <img 
        src="/image17.png" 
        alt={name} 
        className="h-full w-full object-cover transition-transform group-hover:scale-105" 
      />
    </div>
    {/* Dane pod zdjęciem - mniejszy font i szary kolor */}
    <div className="space-y-0.5">
      <p className="truncate text-[11px] font-medium text-slate-500">{name}</p>
      <p className="text-[11px] text-slate-400">{date}</p>
    </div>
  </div>
);