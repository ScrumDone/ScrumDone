import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { GoLink, GoGitBranch } from "react-icons/go";
import { SiDiscord } from "react-icons/si";

const DevelopmentAction = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <button className="flex items-center gap-1.5 w-full p-1 rounded-md hover:bg-scrumdone-blue-300 transition-all group cursor-pointer text-left">
    {/* Używamy koloru scrumdone-blue-600 */}
    <div className="text-scrumdone-blue-600 flex shrink-0 items-center justify-center">
      {icon}
    </div>
    <span className="text-xs font-semibold text-scrumdone-blue-600 antialiased">
      {text}
    </span>
  </button>
);

export const TaskDevelopment = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div 
        className="flex items-center gap-2 cursor-pointer mb-2" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronDownIcon 
          className={`h-4 w-4 text-black transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} 
        />
        <span className="text-sm font-semibold text-black antialiased">Rozwój</span>
      </div>

      {isOpen && (
        <div className="space-y-0.5 pl-5 font-bold">
          <DevelopmentAction icon={<GoLink size={16} />} text="Stwórz Pull Request" />
          <DevelopmentAction icon={<GoGitBranch size={16} />} text="Stwórz nową gałąź" />
          <DevelopmentAction icon={<SiDiscord size={15} />} text="Napisz na discord" />
        </div>
      )}
    </div>
  );
};