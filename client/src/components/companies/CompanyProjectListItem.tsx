import React from 'react';
import { formatCount, PLURALS } from '../../utils/plural';
import { Link } from 'react-router-dom';
import { Unlink } from 'lucide-react';
import type { ProjectCardViewModel } from '../../utils/projectDisplay';

type CompanyProjectListItemProps = ProjectCardViewModel & {
  onDetach: (projectId: string) => void;
};

const CompanyProjectListItem: React.FC<CompanyProjectListItemProps> = ({
  id,
  name,
  hexColor,
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
      className="flex w-full flex-col gap-2 rounded-[14px] border border-l-4 border-gray-100 bg-white p-4 transition-shadow sm:p-6 duration-300 hover:shadow-lg"
      style={{ borderLeftColor: hexColor }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 break-words text-xl font-medium text-gray-900">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: hexColor }} aria-hidden="true" />
          {name}
        </h3>
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

      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-700">
        <span>
          {startDate} - {endDate}
        </span>
        <span className="text-gray-400">•</span>
        <span>{formatCount(membersCount, PLURALS.members)}</span>
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
