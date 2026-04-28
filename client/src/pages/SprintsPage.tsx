import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import Avatar from '../components/Avatar';
import { projects } from '../data/projects';

type TaskItem = {
  id: string;
  name: string;
  assigneeInitials: string;
  status: 'Ukończone' | 'Nieukończone';
  daysLeft: string;
  color: 'red' | 'yellow' | 'green' | 'blue';
};

type SprintData = {
  id: string;
  title: string;
  dateRange: string;
  totalTasks: number;
  completedTasks: number;
  status: 'Aktywny' | 'Zaplanowany' | 'Ukończony';
  tasks: TaskItem[];
};

const sprintStatusColorMap: Record<string, string> = {
  Aktywny: 'bg-blue-50 border-blue-200',
  Zaplanowany: 'border-slate-200',
  Ukończony: 'bg-green-50 border-green-200',
};

const sprintStatusBadgeMap: Record<string, string> = {
  Aktywny: 'bg-blue-100 text-blue-700',
  Zaplanowany: 'bg-slate-100 text-slate-700',
  Ukończony: 'bg-green-100 text-green-700',
};

const taskColorMap: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
};

const allSprintsData: SprintData[] = [
  {
    id: 'sprint-0',
    title: 'Sprint 0 - Setup',
    dateRange: '15 sty 2026 - 05 lut 2026',
    totalTasks: 4,
    completedTasks: 3,
    status: 'Ukończony',
    tasks: [
      { id: 'project-init', name: 'Project initialization', assigneeInitials: 'AN', status: 'Ukończone', daysLeft: '22 sty', color: 'red' },
      { id: 'git-setup', name: 'Git repository setup', assigneeInitials: 'EB', status: 'Ukończone', daysLeft: '25 sty', color: 'yellow' },
      { id: 'dev-env', name: 'Development environment', assigneeInitials: 'MK', status: 'Ukończone', daysLeft: '01 lut', color: 'red' },
      { id: 'ci-cd', name: 'CI/CD pipeline', assigneeInitials: 'AN', status: 'Ukończone', daysLeft: '05 lut', color: 'green' },
    ],
  },
  {
    id: 'sprint-1',
    title: 'Sprint 1 - Core Features',
    dateRange: '06 lut 2026 - 19 lut 2026',
    totalTasks: 3,
    completedTasks: 3,
    status: 'Ukończony',
    tasks: [
      { id: 'user-mgmt', name: 'User management module', assigneeInitials: 'EB', status: 'Ukończone', daysLeft: '15 lut', color: 'red' },
      { id: 'auth-sys', name: 'Authentication system', assigneeInitials: 'MK', status: 'Ukończone', daysLeft: '18 lut', color: 'yellow' },
      { id: 'dashboard', name: 'Dashboard base layout', assigneeInitials: 'AN', status: 'Ukończone', daysLeft: '20 lut', color: 'yellow' },
    ],
  },
  {
    id: 'sprint-2',
    title: 'Sprint 2 - UI/UX',
    dateRange: '27 lut 2026 - 14 mar 2026',
    totalTasks: 3,
    completedTasks: 2,
    status: 'Aktywny',
    tasks: [
      { id: 'ui-lib', name: 'UI component library', assigneeInitials: 'EB', status: 'Ukończone', daysLeft: '05 mar', color: 'red' },
      { id: 'responsive', name: 'Responsive design', assigneeInitials: 'MK', status: 'Ukończone', daysLeft: '08 mar', color: 'green' },
      { id: 'accessibility', name: 'Accessibility improvements', assigneeInitials: 'AN', status: 'Nieukończone', daysLeft: '12 mar', color: 'blue' },
    ],
  },
  {
    id: 'sprint-3',
    title: 'Sprint 3 - Testing',
    dateRange: '15 mar 2026 - 05 kwi 2026',
    totalTasks: 4,
    completedTasks: 0,
    status: 'Zaplanowany',
    tasks: [
      { id: 'unit-tests', name: 'Unit tests', assigneeInitials: 'AN', status: 'Nieukończone', daysLeft: '20 mar', color: 'red' },
      { id: 'integration', name: 'Integration tests', assigneeInitials: 'EB', status: 'Nieukończone', daysLeft: '25 mar', color: 'yellow' },
      { id: 'e2e', name: 'E2E tests', assigneeInitials: 'MK', status: 'Nieukończone', daysLeft: '01 kwi', color: 'green' },
      { id: 'perf', name: 'Performance testing', assigneeInitials: 'AN', status: 'Nieukończone', daysLeft: '05 kwi', color: 'blue' },
    ],
  },
];

const SprintsPage: React.FC = () => {
  const { projectSlug } = useParams();
  const project = projects.find((item) => item.slug === projectSlug);
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['sprint-2']));

  const toggleSprint = (sprintId: string) => {
    const newExpanded = new Set(expandedSprints);
    if (newExpanded.has(sprintId)) {
      newExpanded.delete(sprintId);
    } else {
      newExpanded.add(sprintId);
    }
    setExpandedSprints(newExpanded);
  };

  const groupedSprints = {
    active: allSprintsData.filter((s) => s.status === 'Aktywny'),
    planned: allSprintsData.filter((s) => s.status === 'Zaplanowany'),
    completed: allSprintsData.filter((s) => s.status === 'Ukończony'),
  };

  if (!project) {
    return (
      <div className="min-h-screen w-full bg-[#F9FAFB]">
        <SideBar />
        <TopBar />
        <main className="ml-64 pt-(--app-header-h)">
          <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
            Nie znaleziono projektu o podanym adresie.
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <ProjectTopBar project={project} viewMode="scrum" />

        <section className="mx-6 mt-6 pb-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-6">
              {/* Aktywne sprinty */}
              {groupedSprints.active.length > 0 && (
                <div>
                  <h3 className="mb-4 font-segoe-ui text-sm font-medium text-slate-600">Aktywny sprint</h3>
                  <div className="space-y-3">
                    {groupedSprints.active.map((sprint) => (
                      <div
                        key={sprint.id}
                        className={`rounded-xl border px-5 py-4 ${sprintStatusColorMap[sprint.status]}`}
                      >
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() => toggleSprint(sprint.id)}
                        >
                          <div className="flex-1">
                            <h4 className="font-segoe-ui text-base font-medium text-slate-900">{sprint.title}</h4>
                            <p className="font-segoe-ui text-sm text-slate-500">
                              {sprint.dateRange} • {sprint.totalTasks} zadań • {sprint.completedTasks} ukończonych ({Math.round((sprint.completedTasks / sprint.totalTasks) * 100)}%)
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 font-segoe-ui text-xs font-medium ${sprintStatusBadgeMap[sprint.status]}`}>
                            {sprint.status}
                          </span>
                          {expandedSprints.has(sprint.id) ? (
                            <ChevronUpIcon className="ml-4 h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="ml-4 h-5 w-5" />
                          )}
                        </div>

                        {expandedSprints.has(sprint.id) && (
                          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                            {sprint.tasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100">
                                <div className="flex items-center gap-3">
                                  <span className={`h-2 w-2 rounded-full ${taskColorMap[task.color]}`} />
                                  <p className="font-segoe-ui text-sm text-slate-900">{task.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`rounded-full px-2 py-1 font-segoe-ui text-xs ${task.status === 'Ukończone' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {task.status}
                                  </span>
                                  <span className="font-segoe-ui text-xs text-slate-500">{task.daysLeft}</span>
                                  <Avatar initials={task.assigneeInitials} size="xs" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Zaplanowane sprinty */}
              {groupedSprints.planned.length > 0 && (
                <div>
                  <h3 className="mb-4 font-segoe-ui text-sm font-medium text-slate-600">Zaplanowane sprinty ({groupedSprints.planned.length})</h3>
                  <div className="space-y-3">
                    {groupedSprints.planned.map((sprint) => (
                      <div
                        key={sprint.id}
                        className={`rounded-xl border px-5 py-4 ${sprintStatusColorMap[sprint.status]}`}
                      >
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() => toggleSprint(sprint.id)}
                        >
                          <div className="flex-1">
                            <h4 className="font-segoe-ui text-base font-medium text-slate-900">{sprint.title}</h4>
                            <p className="font-segoe-ui text-sm text-slate-500">
                              {sprint.dateRange} • {sprint.totalTasks} zadań
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 font-segoe-ui text-xs font-medium ${sprintStatusBadgeMap[sprint.status]}`}>
                            {sprint.status}
                          </span>
                          {expandedSprints.has(sprint.id) ? (
                            <ChevronUpIcon className="ml-4 h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="ml-4 h-5 w-5" />
                          )}
                        </div>

                        {expandedSprints.has(sprint.id) && (
                          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                            {sprint.tasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100">
                                <div className="flex items-center gap-3">
                                  <span className={`h-2 w-2 rounded-full ${taskColorMap[task.color]}`} />
                                  <p className="font-segoe-ui text-sm text-slate-900">{task.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`rounded-full px-2 py-1 font-segoe-ui text-xs ${task.status === 'Ukończone' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {task.status}
                                  </span>
                                  <span className="font-segoe-ui text-xs text-slate-500">{task.daysLeft}</span>
                                  <Avatar initials={task.assigneeInitials} size="xs" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ukończone sprinty */}
              {groupedSprints.completed.length > 0 && (
                <div>
                  <h3 className="mb-4 font-segoe-ui text-sm font-medium text-slate-600">Ukończone sprinty ({groupedSprints.completed.length})</h3>
                  <div className="space-y-3">
                    {groupedSprints.completed.map((sprint) => (
                      <div
                        key={sprint.id}
                        className={`rounded-xl border px-5 py-4 ${sprintStatusColorMap[sprint.status]}`}
                      >
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() => toggleSprint(sprint.id)}
                        >
                          <div className="flex-1">
                            <h4 className="font-segoe-ui text-base font-medium text-slate-900">{sprint.title}</h4>
                            <p className="font-segoe-ui text-sm text-slate-500">
                              {sprint.dateRange} • {sprint.totalTasks} zadań • {sprint.completedTasks} ukończonych ({Math.round((sprint.completedTasks / sprint.totalTasks) * 100)}%)
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 font-segoe-ui text-xs font-medium ${sprintStatusBadgeMap[sprint.status]}`}>
                            {sprint.status}
                          </span>
                          {expandedSprints.has(sprint.id) ? (
                            <ChevronUpIcon className="ml-4 h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="ml-4 h-5 w-5" />
                          )}
                        </div>

                        {expandedSprints.has(sprint.id) && (
                          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                            {sprint.tasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100">
                                <div className="flex items-center gap-3">
                                  <span className={`h-2 w-2 rounded-full ${taskColorMap[task.color]}`} />
                                  <p className="font-segoe-ui text-sm text-slate-900">{task.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`rounded-full px-2 py-1 font-segoe-ui text-xs ${task.status === 'Ukończone' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {task.status}
                                  </span>
                                  <span className="font-segoe-ui text-xs text-slate-500">{task.daysLeft}</span>
                                  <Avatar initials={task.assigneeInitials} size="xs" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtry po prawej */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-[10px] border border-gray-200 bg-white p-4">
                <h3 className="mb-3 font-segoe-ui text-[14px] font-medium text-slate-900">Sprinty</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
                    <span className="font-segoe-ui text-sm text-slate-700">Aktywne</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
                    <span className="font-segoe-ui text-sm text-slate-700">Zaplanowane</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
                    <span className="font-segoe-ui text-sm text-slate-700">Ukończone</span>
                  </label>
                </div>
              </div>

              <div className="rounded-[10px] border border-gray-200 bg-white p-4">
                <h3 className="mb-3 font-segoe-ui text-[14px] font-medium text-slate-900">Status ukończenia</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
                    <span className="font-segoe-ui text-sm text-slate-700">Ukończone</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
                    <span className="font-segoe-ui text-sm text-slate-700">Nieukończone</span>
                  </label>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SprintsPage;
