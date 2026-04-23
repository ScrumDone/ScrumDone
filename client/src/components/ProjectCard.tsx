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
    <div className="w-full bg-white p-6 rounded-[14px] border border-gray-100 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
      
      {/* NAZWA I KLIENCI */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{clientName}</p>
        </div>
        <span className="inline-flex items-center justify-center bg-scrumdone-blue-main text-white text-[12px] leading-4 font-medium px-2 py-0.5 rounded-lg whitespace-nowrap w-fit">
          {status}
        </span>
      </div>

      {/* OPIS */}
      <p className="text-sm text-gray-600 leading-relaxed min-h-10">
        {description}
      </p>

      {/* SZCZEGÓŁY */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <CalendarIcon className="w-4 h-4" />
          <span>{startDate} - {endDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <UsersIcon className="w-4 h-4" />
          <span>{membersCount} członków</span>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Postęp</span>
          <span className="text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
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