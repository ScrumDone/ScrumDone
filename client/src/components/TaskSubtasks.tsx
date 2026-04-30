import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export const TaskSubtasks = () => (
  // ZMIANA: Dodano strukturę kafelka, pading, cień i margines górny dla odstępu
  <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    
    {/* Nagłówek kafelka */}
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
        {/* ZMIANA: Powiększony font nagłówka */}
        <h2 className="text-[17px] font-bold text-black">Zadania podrzędne</h2>
      </div>
      
      {/* ZMIANA: Jedna ikona pionowych trzech kropek zamiast plusa */}
      <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 hover:text-black">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>
    </div>

    {/* ZMIANA: Wcięcie pl-7 i szary tekst przycisku dodawania, bez underline */}
    <div className="pl-7">
      <button className="text-[13px] text-slate-500 font-medium hover:text-black transition-colors">
        Dodaj zadanie podrzędne
      </button>
    </div>
  </section>
);