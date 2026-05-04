import React, { useState } from 'react';
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import Avatar from '../components/Avatar';
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter';
import SprintSelector, { type Sprint } from '../components/SprintSelector';
import { projects } from '../data/projects';

type PriorityOption = {
  id: string;
  label: string;
  colorClass: string;
};

type TaskDotColor = 'red' | 'yellow' | 'green' | 'blue';

type KanbanTask = {
  id: string;
  title: string;
  assigneeInitials: string;
  assigneeName: string;
  dateLabel: string;
  dotColor: TaskDotColor;
};

type KanbanColumn = {
  id: string;
  title: string;
  accentClass: string;
  count: number;
  tasks: KanbanTask[];
};

const teamMembers: PersonFilter[] = [
  { id: 'artur-nowak', initials: 'AN', fullName: 'Artur Nowak' },
  { id: 'eryk-baczynski', initials: 'EB', fullName: 'Eryk Baczyński' },
  { id: 'maria-kowalska', initials: 'MK', fullName: 'Maria Kowalska' },
];

const priorityOptions: PriorityOption[] = [
  { id: 'wysoki', label: 'Wysoki', colorClass: 'bg-scrumdone-red-500' },
  { id: 'sredni', label: 'Średni', colorClass: 'bg-scrumdone-yellow-500' },
  { id: 'niski', label: 'Niski', colorClass: 'bg-scrumdone-green-500' },
];

const taskDotClassMap: Record<TaskDotColor, string> = {
  red: 'bg-scrumdone-red-500',
  yellow: 'bg-scrumdone-yellow-500',
  green: 'bg-scrumdone-green-500',
  blue: 'bg-scrumdone-blue-main',
};

const sprintsData: Sprint[] = [
  {
    id: 'sprint-0',
    title: 'Sprint 0 - Setup',
    dateRange: '15 sty 2026 - 05 lut 2026',
    totalTasks: 4,
    completedTasks: 3,
    status: 'Ukończony',
  },
  {
    id: 'sprint-1',
    title: 'Sprint 1 - Core Features',
    dateRange: '06 lut 2026 - 19 lut 2026',
    totalTasks: 8,
    completedTasks: 1,
    status: 'Aktywny',
  },
  {
    id: 'sprint-2',
    title: 'Sprint 2 - Testing',
    dateRange: '20 lut 2026 - 05 mar 2026',
    totalTasks: 6,
    completedTasks: 0,
    status: 'Planowany',
  },
];

const kanbanColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'Do zrobienia',
    accentClass: 'bg-slate-400',
    count: 0,
    tasks: [],
  },
  {
    id: 'in-progress',
    title: 'W toku',
    accentClass: 'bg-scrumdone-blue-main',
    count: 1,
    tasks: [
      {
        id: 'cicd-pipeline',
        title: 'CI/CD pipeline',
        assigneeInitials: 'AN',
        assigneeName: 'Artur Nowak',
        dateLabel: '05 lut',
        dotColor: 'green',
      },
    ],
  },
  {
    id: 'review',
    title: 'Sprawdzanie',
    accentClass: 'bg-scrumdone-yellow-500',
    count: 0,
    tasks: [],
  },
  {
    id: 'done',
    title: 'Gotowe',
    accentClass: 'bg-scrumdone-green-500',
    count: 3,
    tasks: [
      {
        id: 'project-initialization',
        title: 'Project initialization',
        assigneeInitials: 'AN',
        assigneeName: 'Artur Nowak',
        dateLabel: '22 sty',
        dotColor: 'red',
      },
      {
        id: 'git-repository-setup',
        title: 'Git repository setup',
        assigneeInitials: 'EB',
        assigneeName: 'Eryk Baczyński',
        dateLabel: '25 sty',
        dotColor: 'yellow',
      },
      {
        id: 'development-environment',
        title: 'Development environment',
        assigneeInitials: 'MK',
        assigneeName: 'Maria Kowalska',
        dateLabel: '01 lut',
        dotColor: 'red',
      },
    ],
  },
];

const PriorityFilterCard: React.FC = () => {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Priorytet</h3>

      <div className="flex flex-col gap-3">
        {priorityOptions.map((option) => (
          <label key={option.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900"
              aria-label={option.label}
            />
            <span className={`h-2 w-2 rounded-full ${option.colorClass}`} />
            <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{option.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
};

const KanbanTaskCard: React.FC<{ task: KanbanTask }> = ({ task }) => {
  return (
    <article className="rounded-[10px] border border-slate-200 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="max-w-44 font-segoe-ui text-[14px] leading-5 font-medium tracking-[-0.15px] text-slate-900 antialiased">
          {task.title}
        </h3>

        <button type="button" className="rounded-full p-1 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`h-2 w-2 rounded-full ${taskDotClassMap[task.dotColor]}`} aria-hidden="true" />
        <div className="flex gap-2 items-center">
          <span className="font-segoe-ui text-[12px] leading-4 font-normal text-slate-500 antialiased">{task.dateLabel}</span>
          <Avatar
            initials={task.assigneeInitials}
            size="xs"
            bgClassName="bg-scrumdone-blue-main"
            textClassName="text-white"
            />
        </div>
       </div>
    </article>
  );
};

const KanbanColumnView: React.FC<{ column: KanbanColumn }> = ({ column }) => {
  return (
    <section className="flex min-h-80 self-start flex-col gap-3">
      <header className="flex items-center gap-3">
        <span className={`h-6 w-1 rounded-full ${column.accentClass}`} aria-hidden="true" />
        <h3 className="font-segoe-ui text-[16px] leading-6 font-normal text-slate-900 antialiased">{column.title}</h3>
        <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 font-segoe-ui text-[12px] leading-4 font-medium text-slate-600 antialiased">
          {column.count}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 mt-4">
        {column.tasks.length > 0 ? (
          column.tasks.map((task) => <KanbanTaskCard key={task.id} task={task} />)
        ) : (
          <div className=" bg-slate-50 px-4 py-6 text-center font-segoe-ui text-[13px] leading-5 text-slate-400 antialiased">
          </div>
        )}
      </div>
    </section>
  );
};

const ProjectKanbanPage: React.FC = () => {
  const { projectSlug } = useParams();
  const project = projects.find((item) => item.slug === projectSlug);
  const [viewMode, setViewMode] = useState<'kanban' | 'scrum'>('kanban');
  const [currentSprintId, setCurrentSprintId] = useState('sprint-0');

  const handleSprintChange = (sprintId: string) => {
    setCurrentSprintId(sprintId);
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          {project ? (
            <>
              <ProjectTopBar project={project} viewMode={viewMode} onViewModeChange={setViewMode} />

              <section className="mx-6 mt-6 pb-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div className={viewMode === 'kanban' ? 'hidden' : ''}>
                        <SprintSelector
                          sprints={sprintsData}
                          currentSprintId={currentSprintId}
                          onSprintChange={handleSprintChange}
                        />
                      </div>

                      <h2 className={`font-segoe-ui text-[18px] leading-7 font-medium tracking-[-0.44px] text-slate-900 antialiased ${viewMode === 'kanban' ? '' : 'hidden'}`}>
                        Tablica Kanban
                      </h2>

                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-scrumdone-blue-main px-4 py-2.5 font-segoe-ui text-[14px] leading-5 font-medium text-white transition-colors hover:bg-[#00A0DD]"
                      >
                        <PlusIcon className="h-4 w-4 stroke-2" />
                        Dodaj zadanie
                      </button>
                    </div>

                    <div className="grid items-start gap-4 xl:grid-cols-4">
                      {kanbanColumns.map((column) => (
                        <KanbanColumnView key={column.id} column={column} />
                      ))}
                    </div>
                  </div>

                  <aside className="flex flex-col gap-4">
                    <PriorityFilterCard />
                    <CalendarPeopleFilter people={teamMembers} />
                  </aside>
                </div>
              </section>
            </>
          ) : (
            <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
              Nie znaleziono projektu o podanym adresie.
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectKanbanPage;