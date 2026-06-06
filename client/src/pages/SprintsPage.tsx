import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import Avatar from '../components/Avatar';
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter';
import SprintEditModal, { type SprintEditDraft } from '../components/SprintEditModal';
import { projects } from '../data/projects';
import { useProjectViewMode } from '../hooks/useProjectViewMode';

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
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  status: 'Aktywny' | 'Zaplanowany' | 'Ukończony';
  tasks: TaskItem[];
};

const personFilterOptions: PersonFilter[] = [
  { id: 'artur-nowak', initials: 'AN', fullName: 'Artur Nowak' },
  { id: 'eryk-baczynski', initials: 'EB', fullName: 'Eryk Baczyński' },
  { id: 'maria-kowalska', initials: 'MK', fullName: 'Maria Kowalska' },
];

const sprintStatusBadgeMap: Record<string, string> = {
  Aktywny: 'bg-scrumdone-blue-main text-white',
  Zaplanowany: 'bg-white border border-blue-500 text-blue-500',
  Ukończony: 'bg-green-100 text-green-700',
};

const taskColorMap: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
};

const polishMonths = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

const getSprintDateRange = (sprint: SprintData) => `${sprint.startDate} - ${sprint.endDate}`;

const normalizeMonthName = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const parsePolishDate = (value: string) => {
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)\s+(\d{4})$/u);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const monthName = match[2] ?? '';
  const year = Number(match[3]);
  const monthIndex = polishMonths.findIndex((month) => normalizeMonthName(month) === normalizeMonthName(monthName));

  if (Number.isNaN(day) || Number.isNaN(year) || monthIndex < 0) {
    return null;
  }

  const parsedDate = new Date(year, monthIndex, day);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const formatPolishDate = (date: Date) => `${String(date.getDate()).padStart(2, '0')} ${polishMonths[date.getMonth()]} ${date.getFullYear()}`;

const extendDateByDays = (value: string, days: number) => {
  const parsedDate = parsePolishDate(value);

  if (!parsedDate) {
    return value;
  }

  parsedDate.setDate(parsedDate.getDate() + days);
  return formatPolishDate(parsedDate);
};

const allSprintsData: SprintData[] = [
  {
    id: 'sprint-0',
    title: 'Sprint 0 - Setup',
    startDate: '15 sty 2026',
    endDate: '05 lut 2026',
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
    startDate: '06 lut 2026',
    endDate: '19 lut 2026',
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
    id: 'sprint-3',
    title: 'Sprint 3 - Final Sprint',
    startDate: '15 mar 2026',
    endDate: '05 kwi 2026',
    totalTasks: 4,
    completedTasks: 1,
    status: 'Aktywny',
    tasks: [
      { id: 'prepare-ui', name: 'Prepare initial UI project', assigneeInitials: 'EB', status: 'Ukończone', daysLeft: '05 kwi', color: 'red' },
      { id: 'quotes-module', name: 'Quotes Generation Module', assigneeInitials: 'AN', status: 'Nieukończone', daysLeft: '07 kwi', color: 'red' },
      { id: 'giveaway-campaign', name: 'Giveaway Campaign Setup', assigneeInitials: 'MK', status: 'Nieukończone', daysLeft: '09 kwi', color: 'green' },
      { id: 'video-reel', name: 'Video Reel Production', assigneeInitials: 'EB', status: 'Nieukończone', daysLeft: '19 kwi', color: 'yellow' },
    ],
  },
  {
    id: 'sprint-4',
    title: 'Sprint 4 - Testing',
    startDate: '06 kwi 2026',
    endDate: '26 kwi 2026',
    totalTasks: 0,
    completedTasks: 0,
    status: 'Zaplanowany',
    tasks: [],
  },
  {
    id: 'sprint-5',
    title: 'Sprint 5 - Deployment',
    startDate: '27 kwi 2026',
    endDate: '17 maj 2026',
    totalTasks: 0,
    completedTasks: 0,
    status: 'Zaplanowany',
    tasks: [],
  },
];

const SprintsPage: React.FC = () => {
  const { projectSlug } = useParams();
  const project = projects.find((item) => item.slug === projectSlug);
  const { viewMode, setProjectViewMode } = useProjectViewMode(projectSlug);
  const [sprints, setSprints] = useState<SprintData[]>(allSprintsData);
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['sprint-4', 'sprint-5', 'sprint-3']));
  const [isSprintEditOpen, setIsSprintEditOpen] = useState(false);
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);
  const [sprintDraft, setSprintDraft] = useState<SprintEditDraft | null>(null);

  // Filter states
  const [selectedSprints, setSelectedSprints] = useState<Record<string, boolean>>({
    'sprint-0': true,
    'sprint-1': true,
    'sprint-2': true,
    'sprint-3': true,
    'sprint-4': true,
    'sprint-5': true,
  });

  const [selectedPriorities, setSelectedPriorities] = useState<Record<string, boolean>>({
    wysoki: true,
    sredni: true,
    niski: true,
  });

  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, boolean>>({
    ukonczne: true,
    nieukonczne: true,
  });

  const closeSprintEditModal = () => {
    setIsSprintEditOpen(false);
    setEditingSprintId(null);
    setSprintDraft(null);
  };

  const openSprintEditModal = (sprint: SprintData) => {
    setEditingSprintId(sprint.id);
    setSprintDraft({
      title: sprint.title,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
    });
    setIsSprintEditOpen(true);
  };

  const updateSprintById = (sprintId: string, updater: (sprint: SprintData) => SprintData) => {
    setSprints((currentSprints) => currentSprints.map((sprint) => (sprint.id === sprintId ? updater(sprint) : sprint)));
  };

  const handleSprintDraftSave = () => {
    if (!editingSprintId || !sprintDraft) {
      return;
    }

    updateSprintById(editingSprintId, (sprint) => ({
      ...sprint,
      title: sprintDraft.title,
      startDate: sprintDraft.startDate,
      endDate: sprintDraft.endDate,
      status: sprintDraft.status,
    }));
    closeSprintEditModal();
  };

  const handleStartNextSprint = () => {
    if (!editingSprintId) {
      return;
    }

    setSprints((currentSprints) => {
      const currentIndex = currentSprints.findIndex((sprint) => sprint.id === editingSprintId);

      if (currentIndex === -1) {
        return currentSprints;
      }

      const nextPlannedIndex = currentSprints.findIndex((sprint, index) => index > currentIndex && sprint.status === 'Zaplanowany');

      return currentSprints.map((sprint, index) => {
        if (index === currentIndex) {
          return { ...sprint, status: 'Ukończony' };
        }

        if (index === nextPlannedIndex) {
          return { ...sprint, status: 'Aktywny' };
        }

        return sprint;
      });
    });

    setSprintDraft((currentDraft) => (currentDraft ? { ...currentDraft, status: 'Ukończony' } : currentDraft));
  };

  const handleExtendSprint = () => {
    if (!editingSprintId) {
      return;
    }

    setSprintDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const updatedEndDate = extendDateByDays(currentDraft.endDate, 7);

      updateSprintById(editingSprintId, (sprint) => ({
        ...sprint,
        endDate: updatedEndDate,
      }));

      return {
        ...currentDraft,
        endDate: updatedEndDate,
      };
    });
  };

  const handleDeleteSprint = () => {
    if (!editingSprintId) {
      return;
    }

    setSprints((currentSprints) => currentSprints.filter((sprint) => sprint.id !== editingSprintId));
    closeSprintEditModal();
  };

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
    active: sprints.filter((s) => s.status === 'Aktywny'),
    planned: sprints.filter((s) => s.status === 'Zaplanowany'),
    completed: sprints.filter((s) => s.status === 'Ukończony'),
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
        <ProjectTopBar project={project} viewMode={viewMode} onViewModeChange={setProjectViewMode} />

        <section className="mx-6 mt-6 mb-8">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-6 pr-1">
              {/* Aktywne sprinty */}
              {groupedSprints.active.length > 0 && (
                <div>
                  <h3 className="mb-4 font-segoe-ui text-sm font-medium text-slate-600">Aktywny sprint</h3>
                  <div className="space-y-3">
                    {groupedSprints.active.map((sprint) => (
                      <div
                        key={sprint.id}
                        className="overflow-hidden rounded-xl border-2 border-sky-400"
                      >
                        <div className="border-b border-slate-200 bg-white px-5 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => toggleSprint(sprint.id)}
                              className="flex flex-1 items-start gap-3"
                            >
                              {expandedSprints.has(sprint.id) ? (
                                <ChevronUpIcon className="mt-1 h-5 w-5 shrink-0" />
                              ) : (
                                <ChevronDownIcon className="mt-1 h-5 w-5 shrink-0" />
                              )}
                              <div className="text-left">
                                <h4 className="font-segoe-ui text-base font-medium text-slate-900">{sprint.title}</h4>
                                <p className="font-segoe-ui text-sm text-slate-500">
                                  {getSprintDateRange(sprint)} • {sprint.totalTasks} zadań • <span className="text-green-600 font-medium">{sprint.completedTasks} ukończonych ({Math.round((sprint.completedTasks / sprint.totalTasks) * 100)}%)</span>
                                </p>
                              </div>
                            </button>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`rounded-lg px-3 py-1 font-segoe-ui text-xs font-medium ${sprintStatusBadgeMap[sprint.status]}`}>
                                {sprint.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => openSprintEditModal(sprint)}
                                className="flex h-6 w-6 items-center justify-center text-slate-600 hover:text-slate-900"
                                aria-label={`Edytuj sprint ${sprint.title}`}
                              >
                                <Cog6ToothIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {expandedSprints.has(sprint.id) && (
                          <div className="bg-slate-50 px-4 py-3">
                            <div className="space-y-3">
                              {sprint.tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <span className={`h-2 w-2 rounded-full ${taskColorMap[task.color]}`} />
                                    <p className={`font-segoe-ui text-sm ${task.status === 'Ukończone' ? 'line-through text-slate-500' : 'text-slate-900'}`}>{task.name}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Avatar initials={task.assigneeInitials} size="xs" />
                                    <span className="font-segoe-ui text-xs text-slate-700">{task.assigneeInitials === 'AN' ? 'Artur Nowak' : task.assigneeInitials === 'EB' ? 'Eryk Baczyński' : 'Maria Kowalska'}</span>
                                    <span className={`rounded-lg px-2.5 py-1 font-segoe-ui text-xs font-medium ${task.status === 'Ukończone' ? 'border border-green-600 text-green-600' : 'bg-slate-100 text-slate-700'}`}>
                                      {task.status}
                                    </span>
                                    <span className="font-segoe-ui text-xs text-slate-500">{task.daysLeft}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
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
                        className="overflow-hidden rounded-xl border border-slate-200"
                      >
                        <div className="border-b border-slate-200 bg-white px-5 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => toggleSprint(sprint.id)}
                              className="flex flex-1 items-start gap-3"
                            >
                              {expandedSprints.has(sprint.id) ? (
                                <ChevronUpIcon className="mt-1 h-5 w-5 shrink-0" />
                              ) : (
                                <ChevronDownIcon className="mt-1 h-5 w-5 shrink-0" />
                              )}
                              <div className="text-left">
                                <h4 className="font-segoe-ui text-base font-medium text-slate-900">{sprint.title}</h4>
                                <p className="font-segoe-ui text-sm text-slate-500">
                                  {getSprintDateRange(sprint)} • {sprint.totalTasks} zadań
                                </p>
                              </div>
                            </button>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`rounded-lg px-3 py-1 font-segoe-ui text-xs font-medium ${sprintStatusBadgeMap[sprint.status]}`}>
                                {sprint.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => openSprintEditModal(sprint)}
                                className="flex h-6 w-6 items-center justify-center text-slate-600 hover:text-slate-900"
                                aria-label={`Edytuj sprint ${sprint.title}`}
                              >
                                <Cog6ToothIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {expandedSprints.has(sprint.id) && (
                          <div className="bg-slate-50 px-5 py-11 text-center">
                            <p className="font-segoe-ui text-sm font-medium text-slate-500">Brak zadań w tym sprincie</p>
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
                        className="rounded-xl border border-slate-200 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="border-b border-slate-200 bg-white px-5 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => toggleSprint(sprint.id)}
                              className="flex flex-1 items-start gap-3"
                            >
                              {expandedSprints.has(sprint.id) ? (
                                <ChevronUpIcon className="mt-1 h-5 w-5 shrink-0" />
                              ) : (
                                <ChevronDownIcon className="mt-1 h-5 w-5 shrink-0" />
                              )}
                              <div className="text-left">
                                <h4 className="font-segoe-ui text-base font-medium text-slate-900">{sprint.title}</h4>
                                <p className="font-segoe-ui text-sm text-slate-500">
                                  {getSprintDateRange(sprint)} • {sprint.totalTasks} zadań • <span className="text-green-600 font-medium">{sprint.completedTasks} ukończonych ({Math.round((sprint.completedTasks / sprint.totalTasks) * 100)}%)</span>
                                </p>
                              </div>
                            </button>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`rounded-full px-3 py-1 font-segoe-ui text-xs font-medium ${sprintStatusBadgeMap[sprint.status]}`}>
                                {sprint.status}
                              </span>
                              <button type="button" className="flex h-6 w-6 items-center justify-center text-slate-600 hover:text-slate-900">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Tasks */}
                        {expandedSprints.has(sprint.id) && (
                          <div className="bg-slate-50 px-5 py-3">
                            <div className="space-y-2">
                              {sprint.tasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className={`h-2 w-2 rounded-full ${taskColorMap[task.color]}`} />
                                  <p className={`font-segoe-ui text-sm ${task.status === 'Ukończone' ? 'line-through text-slate-500' : 'text-slate-900'}`}>{task.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Avatar initials={task.assigneeInitials} size="xs" />
                                  <span className="font-segoe-ui text-xs text-slate-700">{task.assigneeInitials === 'AN' ? 'Artur Nowak' : task.assigneeInitials === 'EB' ? 'Eryk Baczyński' : 'Maria Kowalska'}</span>
                                  <span className={`rounded-full px-2.5 py-1 font-segoe-ui text-xs font-medium ${task.status === 'Ukończone' ? 'border border-green-600 text-green-600' : 'bg-slate-100 text-slate-700'}`}>
                                    {task.status}
                                  </span>
                                  <span className="font-segoe-ui text-xs text-slate-500">{task.daysLeft}</span>
                                </div>
                              </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Filtry po prawej */}
            <aside className="sticky top-(--app-header-h) flex max-h-[calc(100vh-var(--app-header-h))] flex-col gap-4 overflow-y-auto pl-1">
              {/* Sprinty */}
              <section className="rounded-[10px] border border-gray-200 bg-white p-4">
                <h3 className="mb-3 font-segoe-ui text-[14px] font-medium text-slate-900">Sprinty</h3>
                <div className="flex flex-col gap-2">
                  {sprints.map((sprint) => {
                    const sprintId = sprint.id;
                    const isSelected = selectedSprints[sprintId] ?? true;

                    return (
                      <button
                        key={sprintId}
                        type="button"
                        onClick={() =>
                          setSelectedSprints((prev) => ({
                            ...prev,
                            [sprintId]: !prev[sprintId],
                          }))
                        }
                        className="flex items-center gap-2 text-left"
                        aria-pressed={isSelected}
                      >
                        <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                          <CheckIcon className="h-3 w-3" strokeWidth={2.5} />
                        </span>
                        <span className="font-segoe-ui text-sm text-slate-900">{sprint.title}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Priorytet */}
              <section className="rounded-[10px] border border-gray-200 bg-white p-4">
                <h3 className="mb-3 font-segoe-ui text-[14px] font-medium text-slate-900">Priorytet</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'wysoki', label: 'Wysoki', colorClass: 'bg-scrumdone-red-500' },
                    { id: 'sredni', label: 'Średni', colorClass: 'bg-scrumdone-yellow-500' },
                    { id: 'niski', label: 'Niski', colorClass: 'bg-scrumdone-green-500' },
                  ].map((priority) => {
                    const isSelected = selectedPriorities[priority.id] ?? true;

                    return (
                      <button
                        key={priority.id}
                        type="button"
                        onClick={() =>
                          setSelectedPriorities((prev) => ({
                            ...prev,
                            [priority.id]: !prev[priority.id],
                          }))
                        }
                        className="flex items-center gap-2 text-left"
                        aria-pressed={isSelected}
                      >
                        <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                          <CheckIcon className="h-3 w-3" strokeWidth={2.5} />
                        </span>
                        <span className={`h-2 w-2 rounded-full ${priority.colorClass}`} />
                        <span className="font-segoe-ui text-sm text-slate-900">{priority.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Członkowie zespołu */}
              <CalendarPeopleFilter people={personFilterOptions} title="Członkowie zespołu" />

              {/* Status ukończenia */}
              <section className="rounded-[10px] border border-gray-200 bg-white p-4">
                <h3 className="mb-3 font-segoe-ui text-[14px] font-medium text-slate-900">Status ukończenia</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'ukonczne', label: 'Ukończone' },
                    { id: 'nieukonczne', label: 'Nieukończone' },
                  ].map((status) => {
                    const isSelected = selectedStatuses[status.id] ?? true;

                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() =>
                          setSelectedStatuses((prev) => ({
                            ...prev,
                            [status.id]: !prev[status.id],
                          }))
                        }
                        className="flex items-center gap-2 text-left"
                        aria-pressed={isSelected}
                      >
                        <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                          <CheckIcon className="h-3 w-3" strokeWidth={2.5} />
                        </span>
                        <span className="font-segoe-ui text-sm text-slate-900">{status.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Backlog */}
              <section className="rounded-[10px] border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-segoe-ui text-[14px] font-medium text-slate-900">Backlog (4)</h3>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-scrumdone-blue-main px-4 text-sm font-medium text-white hover:bg-blue-600"
                    title="Dodaj zadanie"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'code-refactor', name: 'Code refactoring - user module', color: 'green', assignee: 'AN', assigneeName: 'Artur Nowak' },
                    { id: 'doc-update', name: 'Documentation update', color: 'yellow', assignee: 'EB', assigneeName: 'Eryk Baczyński' },
                    { id: 'e2e-setup', name: 'E2E testing setup', color: 'red', assignee: 'EB', assigneeName: 'Eryk Baczyński' },
                    { id: 'mobile-responsive', name: 'Mobile responsiveness', color: 'yellow', assignee: 'MK', assigneeName: 'Maria Kowalska' },
                  ].map((task) => (
                    <div key={task.id} className="rounded-lg border-2 border-slate-200 bg-slate-50 p-2 hover:bg-slate-100">
                      <div className=" flex mb-1 items-start gap-2">
                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${taskColorMap[task.color as keyof typeof taskColorMap]}`} />
                        <p className="font-segoe-ui text-[12px] leading-4 text-slate-900">{task.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar initials={task.assignee} size="xs" />
                        <span className="font-segoe-ui text-[10px] tracking-[0.12px] leading-4 text-slate-700">{task.assigneeName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>

      <SprintEditModal
        isOpen={isSprintEditOpen}
        draft={sprintDraft}
        onClose={closeSprintEditModal}
        onSave={handleSprintDraftSave}
        onDraftChange={setSprintDraft}
        onStartNextSprint={handleStartNextSprint}
        onExtendSprint={handleExtendSprint}
        onDeleteSprint={handleDeleteSprint}
      />
    </div>
  );
};

export default SprintsPage;
