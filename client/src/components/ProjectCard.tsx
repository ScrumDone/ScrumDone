import React from 'react';
import { CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';

interface ProjectCardProps {
  name: string;
  clientName: string;
  description: string;
  startDate: string;
  endDate: string;
  membersCount: number;
  progress: number;
  status: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  name, clientName, description, startDate, endDate, membersCount, progress, status 
}) => {
  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
      
      {/* NAZWA I KLIENCI */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl text-gray-900">{name}</h3>
          <p className="text-sm text-gray-400 font-medium">{clientName}</p>
        </div>
        <span className="bg-cyan-400 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
          {status}
        </span>
      </div>

      {/* OPIS */}
      <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">
        {description}
      </p>

      {/* SZCZEGÓŁY */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <CalendarIcon className="w-4 h-4" />
          <span>{startDate} - {endDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <UsersIcon className="w-4 h-4" />
          <span>{membersCount} członków</span>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Postęp</span>
          <span className="text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-black h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;