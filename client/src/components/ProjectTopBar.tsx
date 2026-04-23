import React from 'react';
import { ArrowLeftIcon, CalendarDaysIcon, PencilSquareIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import type { ProjectData } from '../data/projects';

interface ProjectTopBarProps {
  project: ProjectData;
}

const projectTabs = ['Tablica Kanban', 'Kalendarz', 'Sprinty', 'Repozytorium plikow'];

const ProjectTopBar: React.FC<ProjectTopBarProps> = ({ project }) => {
  return (
    <section className=" bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="mb-4">
          <Link to="/projects" className="inline-flex items-center gap-2 leading-5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" />
            Powrot do projektów
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-88 flex-1 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700">
              {project.name.slice(0, 1)}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl leading-8  text-slate-900 tracking-[0.07]">{project.name}</h1>
              <a className="w-fit text-sm leading-5 tracking-[-0.15] text-scrumdone-blue-main">
                {project.clientName}
              </a>
              <p className="text-[16px] tracking-[-0.31px] text-slate-600">{project.description}</p>

              <div className="mt-1 flex flex-wrap items-center gap-6 text-slate-600">
                <div className="inline-flex items-center gap-2 text-sm leading-5 tracking-[-0.15]">
                  <CalendarDaysIcon className="h-4 w-4" />
                  {project.startDate} - {project.endDate}
                </div>
                <div className="inline-flex items-center gap-2 text-sm leading-5 tracking-[-0.15]">
                  <UserGroupIcon className="h-4 w-4" />
                  {project.membersCount} członków zespołu
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-56 flex-col items-stretch gap-3">
            <div className="inline-flex w-full gap-2 rounded-[10px] bg-slate-50 p-1">
              <button className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900">Kanban</button>
              <button className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-700">Scrum</button>
            </div>

            <button className="inline-flex w-full items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50">
              <PencilSquareIcon className="h-4 w-4" />
              Edytuj projekt
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 px-6 py-3">
        {projectTabs.map((tab) => (
          <button key={tab} className="text-xl text-slate-800 hover:text-slate-950">
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ProjectTopBar;
