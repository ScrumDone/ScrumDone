import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import Avatar from '../components/Avatar';
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter';
import SprintEditModal, { type SprintEditDraft } from '../components/SprintEditModal';
import { useDeleteSprint } from '../hooks/useDeleteSprint';
import { useProjectSprints } from '../hooks/useProjectSprints';
import { useProjectViewMode } from '../hooks/useProjectViewMode';
import { useUpdateSprint } from '../hooks/useUpdateSprint';
import {
  addDaysToDisplayDate,
  deriveSprintStatusFromDisplayDates,
  mapSprintSummaryToEditDraft,
  mapSprintSummaryToSprintCard,
  toSprintEndDateUpdateDto,
  toSprintUpdateDto,
} from '../utils/sprintDisplay';

type TaskItem = {
  id: string;
  name: string;
  assigneeInitials: string;
  status: 'Ukończone' | 'Nieukończone';
  daysLeft: string;
  color: 'red' | 'yellow' | 'green' | 'blue';
};

type BacklogTask = {
  id: string;
  name: string;
  assigneeInitials: string;
  assigneeName: string;
  color: TaskItem['color'];
};

const BACKLOG_ID = 'backlog';

const initialBacklogTasks: BacklogTask[] = [
  {
    id: 'code-refactor',
    name: 'Code refactoring - user module',
    color: 'green',
    assigneeInitials: 'AN',
    assigneeName: 'Artur Nowak',
  },
  {
    id: 'doc-update',
    name: 'Documentation update',
    color: 'yellow',
    assigneeInitials: 'EB',
    assigneeName: 'Eryk Baczyński',
  },
  {
    id: 'e2e-setup',
    name: 'E2E testing setup',
    color: 'red',
    assigneeInitials: 'EB',
    assigneeName: 'Eryk Baczyński',
  },
  {
    id: 'mobile-responsive',
    name: 'Mobile responsiveness',
    color: 'yellow',
    assigneeInitials: 'MK',
    assigneeName: 'Maria Kowalska',
  },
];

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

type BacklogTaskCardProps = {
  task: BacklogTask;
  isDragOverlay?: boolean;
};

const BacklogTaskCard: React.FC<BacklogTaskCardProps> = ({ task, isDragOverlay = false }) => {
  const sortable = useSortable({ id: task.id, disabled: isDragOverlay });
  const style = isDragOverlay
    ? undefined
    : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };

  return (
    <div
      ref={isDragOverlay ? undefined : sortable.setNodeRef}
      style={style}
      {...(isDragOverlay ? {} : sortable.attributes)}
      {...(isDragOverlay ? {} : sortable.listeners)}
      className={`rounded-lg border-2 border-slate-200 bg-slate-50 p-2 hover:bg-slate-100 cursor-grab active:cursor-grabbing ${isDragOverlay ? 'cursor-grabbing shadow-md' : ''} ${sortable.isDragging ? 'opacity-50' : ''}`}
    >
      <div className="mb-1 flex items-start gap-2">
        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${taskColorMap[task.color]}`} />
        <p className="font-segoe-ui text-[12px] leading-4 text-slate-900">{task.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <Avatar initials={task.assigneeInitials} size="xs" />
        <span className="font-segoe-ui text-[10px] tracking-[0.12px] leading-4 text-slate-700">{task.assigneeName}</span>
      </div>
    </div>
  );
};

const getAssigneeName = (initials: string) =>
  personFilterOptions.find((person) => person.initials === initials)?.fullName ?? initials;

const backlogToSprintTask = (task: BacklogTask): TaskItem => ({
  id: task.id,
  name: task.name,
  assigneeInitials: task.assigneeInitials,
  color: task.color,
  status: 'Nieukończone',
  daysLeft: '—',
});

const sprintTaskToBacklog = (task: TaskItem): BacklogTask => ({
  id: task.id,
  name: task.name,
  assigneeInitials: task.assigneeInitials,
  assigneeName: getAssigneeName(task.assigneeInitials),
  color: task.color,
});

type SprintTaskRowProps = {
  task: TaskItem;
  isDragOverlay?: boolean;
};

const SprintTaskRow: React.FC<SprintTaskRowProps> = ({ task, isDragOverlay = false }) => {
  const sortable = useSortable({ id: task.id, disabled: isDragOverlay });
  const style = isDragOverlay
    ? undefined
    : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };

  return (
    <div
      ref={isDragOverlay ? undefined : sortable.setNodeRef}
      style={style}
      {...(isDragOverlay ? {} : sortable.attributes)}
      {...(isDragOverlay ? {} : sortable.listeners)}
      className={`flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 cursor-grab active:cursor-grabbing ${isDragOverlay ? 'cursor-grabbing shadow-md' : ''} ${sortable.isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${taskColorMap[task.color]}`} />
        <p className={`font-segoe-ui text-sm ${task.status === 'Ukończone' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
          {task.name}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Avatar initials={task.assigneeInitials} size="xs" />
        <span className="font-segoe-ui text-xs text-slate-700">{getAssigneeName(task.assigneeInitials)}</span>
        <span
          className={`rounded-lg px-2.5 py-1 font-segoe-ui text-xs font-medium ${task.status === 'Ukończone' ? 'border border-green-600 text-green-600' : 'bg-slate-100 text-slate-700'}`}
        >
          {task.status}
        </span>
        <span className="font-segoe-ui text-xs text-slate-500">{task.daysLeft}</span>
      </div>
    </div>
  );
};

type SprintDropZoneProps = {
  sprintId: string;
  children: React.ReactNode;
  className?: string;
  isHighlighted?: boolean;
};

const SprintDropZone: React.FC<SprintDropZoneProps> = ({
  sprintId,
  children,
  className = '',
  isHighlighted = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: sprintId });
  const showHighlight = isOver || isHighlighted;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-28 bg-slate-50 transition-colors ${showHighlight ? 'bg-sky-50 ring-2 ring-inset ring-sky-400' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

type BacklogDropZoneProps = {
  children: React.ReactNode;
};

const BacklogDropZone: React.FC<BacklogDropZoneProps> = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: BACKLOG_ID });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg transition-colors ${isOver ? 'bg-sky-50 ring-2 ring-inset ring-sky-400' : ''}`}
    >
      {children}
    </div>
  );
};

type ActiveDragItem =
  | { source: 'backlog'; task: BacklogTask }
  | { source: 'sprint'; task: TaskItem; sprintId: string };

const getSprintDateRange = (sprint: SprintData) => `${sprint.startDate} - ${sprint.endDate}`;

const mockSprintsSeed: SprintData[] = [
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

const mockTasksByLegacyId = Object.fromEntries(mockSprintsSeed.map((sprint) => [sprint.id, sprint.tasks]));
const mockTasksByTitle = Object.fromEntries(mockSprintsSeed.map((sprint) => [sprint.title, sprint.tasks]));

const getSeedTasksForSprint = (id: string, title: string): TaskItem[] =>
  mockTasksByLegacyId[id] ?? mockTasksByTitle[title] ?? [];

const getSprintCompletionPercent = (sprint: SprintData) =>
  sprint.totalTasks > 0 ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100) : 0;

const SprintsPage: React.FC = () => {
  const { projectId = '' } = useParams();
  const { viewMode, setProjectViewMode } = useProjectViewMode(projectId);
  const {
    data: sprintsQueryData,
    isLoading: isSprintsLoading,
    isError: isSprintsError,
    error: sprintsError,
  } = useProjectSprints(projectId, 1, 50);
  const {
    mutate: updateSprint,
    isPending: isUpdatingSprint,
    isError: isUpdateSprintError,
    error: updateSprintError,
    reset: resetUpdateSprint,
  } = useUpdateSprint();
  const {
    mutate: deleteSprint,
    isPending: isDeletingSprint,
    isError: isDeleteSprintError,
    error: deleteSprintError,
    reset: resetDeleteSprint,
  } = useDeleteSprint();
  const [sprintTasksById, setSprintTasksById] = useState<Record<string, TaskItem[]>>({});
  const [sprintModalMessage, setSprintModalMessage] = useState<string | null>(null);
  const [backlogTasks, setBacklogTasks] = useState<BacklogTask[]>(initialBacklogTasks);
  const [activeDragItem, setActiveDragItem] = useState<ActiveDragItem | null>(null);
  const [dragOverSprintId, setDragOverSprintId] = useState<string | null>(null);
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(() => new Set());
  const [isSprintEditOpen, setIsSprintEditOpen] = useState(false);
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);
  const [sprintDraft, setSprintDraft] = useState<SprintEditDraft | null>(null);

  // Filter states
  const [selectedSprints, setSelectedSprints] = useState<Record<string, boolean>>({});

  const [selectedPriorities, setSelectedPriorities] = useState<Record<string, boolean>>({
    wysoki: true,
    sredni: true,
    niski: true,
  });

  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, boolean>>({
    ukonczne: true,
    nieukonczne: true,
  });

  useEffect(() => {
    if (!sprintsQueryData?.items) {
      return;
    }

    setSprintTasksById((currentTasks) => {
      const nextTasks = { ...currentTasks };
      let changed = false;

      for (const summary of sprintsQueryData.items) {
        if (nextTasks[summary.id]) {
          continue;
        }

        const title = summary.name?.trim() || '—';
        const seedTasks = getSeedTasksForSprint(summary.id, title);

        if (seedTasks.length > 0) {
          nextTasks[summary.id] = seedTasks;
          changed = true;
        }
      }

      return changed ? nextTasks : currentTasks;
    });
  }, [sprintsQueryData?.items]);

  const sprints = useMemo((): SprintData[] => {
    if (!sprintsQueryData?.items) {
      return [];
    }

    return sprintsQueryData.items.map((summary) => {
      const card = mapSprintSummaryToSprintCard(summary);

      return {
        ...card,
        tasks: sprintTasksById[summary.id] ?? [],
      };
    });
  }, [sprintsQueryData?.items, sprintTasksById]);

  const isSavingSprint = isUpdatingSprint || isDeletingSprint;
  const sprintModalErrorMessage = isUpdateSprintError
    ? updateSprintError?.message
    : isDeleteSprintError
      ? deleteSprintError?.message
      : sprintModalMessage;

  const resetSprintModalMutations = () => {
    resetUpdateSprint();
    resetDeleteSprint();
    setSprintModalMessage(null);
  };

  useEffect(() => {
    if (sprints.length === 0) {
      return;
    }

    setExpandedSprints((currentExpanded) => {
      const nextExpanded = new Set(currentExpanded);

      for (const sprint of sprints) {
        if (sprint.status === 'Aktywny' || sprint.status === 'Zaplanowany') {
          nextExpanded.add(sprint.id);
        }
      }

      return nextExpanded;
    });
  }, [sprints]);

  useEffect(() => {
    if (sprints.length === 0) {
      return;
    }

    setSelectedSprints((currentSelected) => {
      const nextSelected = { ...currentSelected };
      let changed = false;

      for (const sprint of sprints) {
        if (!(sprint.id in nextSelected)) {
          nextSelected[sprint.id] = true;
          changed = true;
        }
      }

      return changed ? nextSelected : currentSelected;
    });
  }, [sprints]);

  const closeSprintEditModal = () => {
    resetSprintModalMutations();
    setIsSprintEditOpen(false);
    setEditingSprintId(null);
    setSprintDraft(null);
  };

  const openSprintEditModal = (sprint: SprintData) => {
    resetSprintModalMutations();

    const summary = sprintsQueryData?.items.find((item) => item.id === sprint.id);
    setEditingSprintId(sprint.id);
    setSprintDraft(
      summary
        ? mapSprintSummaryToEditDraft(summary)
        : {
            title: sprint.title === '—' ? '' : sprint.title,
            startDate: sprint.startDate === '—' ? '' : sprint.startDate,
            endDate: sprint.endDate === '—' ? '' : sprint.endDate,
            status: sprint.status,
          },
    );
    setIsSprintEditOpen(true);
  };

  const handleSprintDraftSave = () => {
    if (!editingSprintId || !sprintDraft) {
      return;
    }

    const dto = toSprintUpdateDto(sprintDraft);
    if (!dto) {
      setSprintModalMessage('Nazwa sprintu jest wymagana.');
      return;
    }

    setSprintModalMessage(null);
    updateSprint(
      { id: editingSprintId, projectId, data: dto },
      {
        onSuccess: () => {
          closeSprintEditModal();
        },
      },
    );
  };

  const handleStartNextSprint = () => {
    setSprintModalMessage('Ta akcja nie jest jeszcze dostępna przez API.');
  };

  const handleExtendSprint = () => {
    if (!editingSprintId || !sprintDraft) {
      return;
    }

    const updatedEndDate = addDaysToDisplayDate(sprintDraft.endDate, 7);

    setSprintModalMessage(null);
    updateSprint(
      { id: editingSprintId, projectId, data: toSprintEndDateUpdateDto(sprintDraft.endDate, 7) },
      {
        onSuccess: () => {
          setSprintDraft((currentDraft) =>
            currentDraft
              ? {
                  ...currentDraft,
                  endDate: updatedEndDate,
                  status: deriveSprintStatusFromDisplayDates(currentDraft.startDate, updatedEndDate),
                }
              : currentDraft,
          );
        },
      },
    );
  };

  const handleDeleteSprint = () => {
    if (!editingSprintId) {
      return;
    }

    setSprintModalMessage(null);
    deleteSprint(
      { id: editingSprintId, projectId },
      {
        onSuccess: () => {
          setSprintTasksById((currentTasks) => {
            const nextTasks = { ...currentTasks };
            delete nextTasks[editingSprintId];
            return nextTasks;
          });
          closeSprintEditModal();
        },
      },
    );
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

  const renderSprintList = () => {
    if (isSprintsLoading) {
      return (
        <p className="py-8 font-segoe-ui text-sm text-slate-500 animate-pulse">
          Ładowanie sprintów...
        </p>
      );
    }

    if (isSprintsError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 font-segoe-ui text-sm text-red-700">
          Nie udało się załadować sprintów{sprintsError?.message ? `: ${sprintsError.message}` : '.'}
        </div>
      );
    }

    if (sprints.length === 0) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center">
          <h2 className="font-segoe-ui text-lg font-medium text-slate-800">Brak sprintów</h2>
          <p className="mt-2 font-segoe-ui text-sm text-slate-500">W tym projekcie nie ma jeszcze żadnych sprintów.</p>
        </div>
      );
    }

    return (
      <>
        {groupedSprints.active.length > 0 && (
          <div>
            <h3 className="mb-4 font-segoe-ui text-sm font-medium text-slate-600">Aktywny sprint</h3>
            <div className="space-y-3">
              {groupedSprints.active.map((sprint) => (
                <div
                  key={sprint.id}
                  className={`overflow-hidden rounded-xl border-2 border-sky-400 transition-colors ${isSprintDropHighlighted(sprint.id) ? 'ring-2 ring-inset ring-sky-400' : ''}`}
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
                            {getSprintDateRange(sprint)} • {sprint.totalTasks} zadań •{' '}
                            <span className="font-medium text-green-600">
                              {sprint.completedTasks} ukończonych ({getSprintCompletionPercent(sprint)}%)
                            </span>
                          </p>
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-3">
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
                    <SprintDropZone
                      sprintId={sprint.id}
                      className="px-4 py-3"
                      isHighlighted={isSprintDropHighlighted(sprint.id)}
                    >
                      {sprint.tasks.length === 0 ? (
                        <div className="py-7 text-center">
                          <p className="font-segoe-ui text-sm font-medium text-slate-500">
                            Brak zadań w tym sprincie — przeciągnij zadanie z backlogu
                          </p>
                        </div>
                      ) : (
                        <SortableContext items={sprint.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-3">
                            {sprint.tasks.map((task) => (
                              <SprintTaskRow key={task.id} task={task} />
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </SprintDropZone>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {groupedSprints.planned.length > 0 && (
          <div>
            <h3 className="mb-4 font-segoe-ui text-sm font-medium text-slate-600">
              Zaplanowane sprinty ({groupedSprints.planned.length})
            </h3>
            <div className="space-y-3">
              {groupedSprints.planned.map((sprint) => (
                <div
                  key={sprint.id}
                  className={`overflow-hidden rounded-xl border border-slate-200 transition-colors ${isSprintDropHighlighted(sprint.id) ? 'ring-2 ring-inset ring-sky-400' : ''}`}
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
                      <div className="flex shrink-0 items-center gap-3">
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
                    <SprintDropZone
                      sprintId={sprint.id}
                      className="px-5 py-4"
                      isHighlighted={isSprintDropHighlighted(sprint.id)}
                    >
                      {sprint.tasks.length === 0 ? (
                        <div className="py-7 text-center">
                          <p className="font-segoe-ui text-sm font-medium text-slate-500">
                            Brak zadań w tym sprincie — przeciągnij zadanie z backlogu
                          </p>
                        </div>
                      ) : (
                        <SortableContext items={sprint.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-3">
                            {sprint.tasks.map((task) => (
                              <SprintTaskRow key={task.id} task={task} />
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </SprintDropZone>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {groupedSprints.completed.length > 0 && (
          <div>
            <h3 className="mb-4 font-segoe-ui text-sm font-medium text-slate-600">
              Ukończone sprinty ({groupedSprints.completed.length})
            </h3>
            <div className="space-y-3">
              {groupedSprints.completed.map((sprint) => (
                <div
                  key={sprint.id}
                  className={`overflow-hidden rounded-xl border border-slate-200 transition-colors ${isSprintDropHighlighted(sprint.id) ? 'ring-2 ring-inset ring-sky-400' : ''}`}
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
                            {getSprintDateRange(sprint)} • {sprint.totalTasks} zadań •{' '}
                            <span className="font-medium text-green-600">
                              {sprint.completedTasks} ukończonych ({getSprintCompletionPercent(sprint)}%)
                            </span>
                          </p>
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`rounded-full px-3 py-1 font-segoe-ui text-xs font-medium ${sprintStatusBadgeMap[sprint.status]}`}>
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
                    <SprintDropZone
                      sprintId={sprint.id}
                      className="px-5 py-3"
                      isHighlighted={isSprintDropHighlighted(sprint.id)}
                    >
                      {sprint.tasks.length === 0 ? (
                        <div className="py-7 text-center">
                          <p className="font-segoe-ui text-sm font-medium text-slate-500">
                            Brak zadań w tym sprincie — przeciągnij zadanie z backlogu
                          </p>
                        </div>
                      ) : (
                        <SortableContext items={sprint.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-2">
                            {sprint.tasks.map((task) => (
                              <SprintTaskRow key={task.id} task={task} />
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </SprintDropZone>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeId = String(active.id);
    const backlogTask = backlogTasks.find((item) => item.id === activeId);
    if (backlogTask) {
      setActiveDragItem({ source: 'backlog', task: backlogTask });
      return;
    }

    const sourceSprint = sprints.find((sprint) => sprint.tasks.some((task) => task.id === activeId));
    const sprintTask = sourceSprint?.tasks.find((task) => task.id === activeId);
    if (sourceSprint && sprintTask) {
      setActiveDragItem({ source: 'sprint', task: sprintTask, sprintId: sourceSprint.id });
    }
  };

  const findSprintByDropTarget = (overId: string) => {
    const sprintById = sprints.find((sprint) => sprint.id === overId);
    if (sprintById) {
      return sprintById;
    }

    return sprints.find((sprint) => sprint.tasks.some((task) => task.id === overId));
  };

  const findSprintWithTask = (taskId: string) =>
    sprints.find((sprint) => sprint.tasks.some((task) => task.id === taskId));

  const isBacklogDropTarget = (overId: string) =>
    overId === BACKLOG_ID || backlogTasks.some((task) => task.id === overId);

  const isSprintDropHighlighted = (sprintId: string) =>
    dragOverSprintId === sprintId && expandedSprints.has(sprintId);

  const handleDragOver = ({ over }: DragOverEvent) => {
    if (!over) {
      setDragOverSprintId(null);
      return;
    }

    const overId = String(over.id);

    if (isBacklogDropTarget(overId)) {
      setDragOverSprintId(null);
      return;
    }

    const targetSprint = findSprintByDropTarget(overId);
    setDragOverSprintId(targetSprint?.id ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragItem(null);
    setDragOverSprintId(null);
    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceSprint = findSprintWithTask(activeId);
    const backlogTask = backlogTasks.find((task) => task.id === activeId);

    if (isBacklogDropTarget(overId)) {
      if (!sourceSprint) {
        return;
      }

      const sprintTask = sourceSprint.tasks.find((task) => task.id === activeId);
      if (!sprintTask) {
        return;
      }

      setSprintTasksById((currentTasks) => ({
        ...currentTasks,
        [sourceSprint.id]: sourceSprint.tasks.filter((task) => task.id !== activeId),
      }));
      setBacklogTasks((currentTasks) => [...currentTasks, sprintTaskToBacklog(sprintTask)]);
      return;
    }

    const targetSprint = findSprintByDropTarget(overId);
    if (!targetSprint || !expandedSprints.has(targetSprint.id)) {
      return;
    }

    if (sourceSprint?.id === targetSprint.id) {
      return;
    }

    if (backlogTask) {
      setBacklogTasks((currentTasks) => currentTasks.filter((task) => task.id !== activeId));
      setSprintTasksById((currentTasks) => ({
        ...currentTasks,
        [targetSprint.id]: [...targetSprint.tasks, backlogToSprintTask(backlogTask)],
      }));
      return;
    }

    if (sourceSprint) {
      const sprintTask = sourceSprint.tasks.find((task) => task.id === activeId);
      if (!sprintTask) {
        return;
      }

      setSprintTasksById((currentTasks) => ({
        ...currentTasks,
        [sourceSprint.id]: sourceSprint.tasks.filter((task) => task.id !== activeId),
        [targetSprint.id]: [...targetSprint.tasks, sprintTask],
      }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 flex h-screen flex-col overflow-hidden pt-(--app-header-h)">
        <ProjectTopBar projectId={projectId} viewMode={viewMode} onViewModeChange={setProjectViewMode} />

        <section className="mx-6 mt-6 mb-6 flex min-h-0 flex-1 flex-col overflow-y-auto xl:overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragCancel={() => setDragOverSprintId(null)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="grid min-h-0 flex-1 gap-6 overflow-hidden xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-6 overscroll-contain pr-1 xl:min-h-0 xl:overflow-y-auto">
              {renderSprintList()}
            </div>

            {/* Filtry po prawej */}
            <aside className="flex min-h-0 flex-col gap-4 overscroll-contain pl-1 xl:min-h-0 xl:overflow-y-auto">
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
              <section className="rounded-[10px] border border-gray-200 bg-white p-4" data-backlog-id={BACKLOG_ID}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-segoe-ui text-[14px] font-medium text-slate-900">
                    Backlog ({backlogTasks.length})
                  </h3>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-scrumdone-blue-main px-4 text-sm font-medium text-white hover:bg-blue-600"
                    title="Dodaj zadanie"
                  >
                    +
                  </button>
                </div>
                <BacklogDropZone>
                  <SortableContext items={backlogTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2">
                      {backlogTasks.map((task) => (
                        <BacklogTaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </SortableContext>
                </BacklogDropZone>
              </section>
            </aside>
            </div>
            </div>

            <DragOverlay>
              {activeDragItem?.source === 'backlog' ? (
                <BacklogTaskCard task={activeDragItem.task} isDragOverlay />
              ) : null}
              {activeDragItem?.source === 'sprint' ? (
                <SprintTaskRow task={activeDragItem.task} isDragOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>
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
        isSaving={isSavingSprint}
        errorMessage={sprintModalErrorMessage}
      />
    </div>
  );
};

export default SprintsPage;
