import React from 'react';
import { ChevronDownIcon, EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import Avatar from '../components/Avatar';
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter';
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

const SprintOverviewCard: React.FC = () => {
  return (
    <section className="flex-1 rounded-[14px] border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-segoe-ui text-[14px] leading-5 font-medium tracking-[-0.15px] text-slate-900 antialiased">
            Sprint 0 - Setup
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-3 font-segoe-ui text-[12px] leading-4 font-normal tracking-[-0.15px] text-slate-500 antialiased">
            <span>15 sty 2026 - 05 lut 2026</span>
            <span>•</span>
            <span>4 zadań</span>
            <span>•</span>
            <span className="text-scrumdone-green-500">3 ukończonych (75%)</span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-segoe-ui text-[12px] leading-4 font-medium text-slate-900 transition-colors hover:bg-slate-50"
        >
          Ukończony
          <ChevronDownIcon className="h-4 w-4 text-slate-500" />
        </button>
      </div>
    </section>
  );
};

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
        <h3 className="max-w-[11rem] font-segoe-ui text-[13px] leading-5 font-normal tracking-[-0.15px] text-slate-900 antialiased">
          {task.title}
        </h3>

        <button type="button" className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className={`h-2 w-2 rounded-full ${taskDotClassMap[task.dotColor]}`} aria-hidden="true" />
          <span className="font-segoe-ui text-[12px] leading-4 font-normal text-slate-500 antialiased">{task.dateLabel}</span>
        </div>

        <Avatar
          initials={task.assigneeInitials}
          size="xs"
          bgClassName="bg-scrumdone-blue-main"
          textClassName="text-white"
        />
      </div>
    </article>
  );
};

const KanbanColumnView: React.FC<{ column: KanbanColumn }> = ({ column }) => {
  return (
    <section className="flex min-h-[20rem] flex-col gap-3">
      <header className="flex items-center gap-3">
        <span className={`h-6 w-1 rounded-full ${column.accentClass}`} aria-hidden="true" />
        <h3 className="font-segoe-ui text-[16px] leading-6 font-normal text-slate-900 antialiased">{column.title}</h3>
        <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 font-segoe-ui text-[12px] leading-4 font-medium text-slate-600 antialiased">
          {column.count}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {column.tasks.length > 0 ? (
          column.tasks.map((task) => <KanbanTaskCard key={task.id} task={task} />)
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-[12px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center font-segoe-ui text-[13px] leading-5 text-slate-400 antialiased">
            Brak zadań
          </div>
        )}
      </div>
    </section>
  );
};

const ProjectKanbanPage: React.FC = () => {
  const { projectSlug } = useParams();
  const project = projects.find((item) => item.slug === projectSlug);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          {project ? (
            <>
              <ProjectTopBar project={project} />

              <section className="mx-6 mt-6 pb-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-start gap-4">
                      <SprintOverviewCard />

                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-scrumdone-blue-main px-4 py-2.5 font-segoe-ui text-[14px] leading-5 font-medium text-white transition-colors hover:bg-[#00A0DD]"
                      >
                        <PlusIcon className="h-4 w-4 stroke-2" />
                        Dodaj zadanie
                      </button>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-4">
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