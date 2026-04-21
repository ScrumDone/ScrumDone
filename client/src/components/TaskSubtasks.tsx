import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

export const TaskSubtasks = () => (
  <section className="mt-8">
    <div className="mb-3 flex items-center justify-between font-semibold">
      <div className="flex items-center gap-2">
        <ChevronDownIcon className="h-4 w-4 text-black" />
        <span className="text-sm font-bold">Zadania podrzędne</span>
      </div>
      <PlusIcon className="h-4 w-4 text-black cursor-pointer" />
    </div>
    <button className="pl-6 text-sm text-black hover:underline">Dodaj zadanie podrzędne</button>
  </section>
);