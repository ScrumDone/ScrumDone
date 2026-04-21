import { ChevronDownIcon } from '@heroicons/react/24/outline';

const AttachmentCard = ({ name, date }: { name: string; date: string }) => (
  <div className="w-[180px] cursor-pointer rounded-lg border border-slate-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-2 h-20 w-full overflow-hidden rounded bg-slate-100">
      <img src="/image17.png" alt="Preview" className="h-full w-full object-cover" />
    </div>
    <p className="truncate text-[10px] font-bold text-black">{name}</p>
    <p className="text-[8px] text-black font-medium">{date}</p>
  </div>
);

export const TaskMainContent = () => (
  <div className="flex flex-col gap-8">
    {/* Główny tytuł zadania */}
    <h1 className="text-[24px] font-extrabold text-black">Components Development</h1>
    
    <section>
      {/* Nagłówek Opis - identyczny styl jak w załącznikach */}
      <div className="mb-3 flex items-center gap-2 font-semibold text-black">
        <ChevronDownIcon className="h-4 w-4 text-black" />
        <span className="text-sm font-bold">Opis</span>
      </div>

      {/* Kontener z wcięciem pl-6 dla tekstu i obrazków */}
      <div className="pl-6">
        <div className="text-sm text-black leading-4 mb-4">
          W tym zadaniu proszę przygotować listę komponentów bla bla wduhwudbw iubwbuduwbh weqbhqwbdhwqb test
        </div>

        {/* Galeria zdjęć wewnątrz opisu - identyczna jak w Attachments */}
        <div className="flex gap-4">
          <AttachmentCard 
            name="Zdjęcie gór zrobion...zdj.1.pdf" 
            date="09 mar 2026, 05:15 AM" 
          />
          <AttachmentCard 
            name="Zdjęcie gór zrobion...zdj.2.pdf" 
            date="09 mar 2026, 05:15 AM" 
          />
        </div>
      </div>
    </section>
  </div>
);