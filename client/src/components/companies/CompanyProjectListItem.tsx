import React from 'react';
import { Link } from 'react-router-dom';
import { Unlink } from 'lucide-react';
import type { ProjectCardViewModel } from '../../utils/projectDisplay';

type CompanyProjectListItemProps = ProjectCardViewModel & {
  onDetach: (projectId: string) => void;
};

const CompanyProjectListItem: React.FC<CompanyProjectListItemProps> = ({
  id,
  name,
  description,
  startDate,
  endDate,
  membersCount,
  progress,
  status,
  onDetach,
}) => {
  const handleDetachClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDetach(id);
  };

  return (
    <Link
      to={`/projects/${id}/tablica-kanban`}
      className="flex w-full flex-col gap-2 rounded-[14px] border border-gray-100 bg-white p-6 transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-medium text-gray-900">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg bg-scrumdone-blue-main px-2 py-0.5 text-[12px] font-medium leading-4 text-white">
            {status}
          </span>
          <button
            type="button"
            onClick={handleDetachClick}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Unlink className="w-4 h-4 text-gray-600" />
            <span>Odepnij</span>
          </button>
        </div>
      </div>

      <p className="min-h-0 text-sm leading-relaxed text-gray-700">{description}</p>

      <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
        <span>
          {startDate} - {endDate}
        </span>
        <span className="text-gray-400">•</span>
        <span>{membersCount} członków</span>
      </div>

      <div className="mt-2">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-700">Postęp</span>
          <span className="text-gray-700">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-300">
          <div
            className="h-2 rounded-full bg-black transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
};

export default CompanyProjectListItem;
