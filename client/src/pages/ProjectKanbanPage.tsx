import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EllipsisVerticalIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import Avatar from '../components/Avatar';
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter';
import SprintSelector from '../components/SprintSelector';
import TaskCreateModal from '../components/TaskCreateModal';
import TaskEditModal, { type TaskEditDraft } from '../components/TaskEditModal';
import { useProjectSprints } from '../hooks/useProjectSprints';
import { useProjectViewMode } from '../hooks/useProjectViewMode';
import { useSelectedProjectSprint } from '../hooks/useSelectedProjectSprint';
import { useProject } from '../hooks/useProject';
import { getInitialsFromName } from '../hooks/useCurrentUser';
import { mapSprintSummariesToSelectorSprints } from '../utils/sprintDisplay';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { useAssignmentStatuses } from '../hooks/useAssignmentStatuses';
import { useAssignmentPriorities } from '../hooks/useAssignmentPriorities';
import { useAssignments } from '../hooks/useAssignments';
import { useUpdateAssignmentStatus } from '../hooks/useUpdateAssignmentStatus';
import { useDeleteAssignment } from '../hooks/useDeleteAssignment';
import { assignmentToKanbanCard } from '../lib/assignmentMappers';
import type { AssignmentPriority } from '../types/assignment';

// --- Typy i Dane pomocnicze ---

type KanbanCardVM = ReturnType<typeof assignmentToKanbanCard>;

type KanbanColumnVm = {
  id: string;
  title: string;
  accentColor: string;
  count: number;
  tasks: KanbanCardVM[];
}

const mapTeamMembersToPersonFilters = (members: { id: string; name: string }[]): PersonFilter[] =>
  members.map((member) => ({
    id: member.id,
    initials: getInitialsFromName(member.name),
    fullName: member.name,
  }));

const matchesPeopleFilter = (
  assignees: { id: string }[],
  selectedAssigneeIds: string[],
) => {
  const primaryAssigneeId = assignees[0]?.id;
  return Boolean(primaryAssigneeId && selectedAssigneeIds.includes(primaryAssigneeId));
};

const buildPeopleFilterOptions = (
  teamMembers: PersonFilter[],
  assignments: { assignees: { id: string; name: string }[] }[],
): PersonFilter[] => {
  const byId = new Map<string, PersonFilter>();

  for (const member of teamMembers) {
    byId.set(member.id, member);
  }

  for (const assignment of assignments) {
    for (const assignee of assignment.assignees) {
      if (!byId.has(assignee.id)) {
        byId.set(assignee.id, {
          id: assignee.id,
          initials: getInitialsFromName(assignee.name),
          fullName: assignee.name,
        });
      }
    }
  }

  return Array.from(byId.values());
};

const PriorityFilterCard: React.FC<{
  priorities: AssignmentPriority[];
  selectedPriorities: Record<string, boolean>;
  onToggle: (priorityId: string) => void;
  isLoading?: boolean;
}> = ({ priorities, selectedPriorities, onToggle, isLoading = false }) => (
  <section className="rounded-[10px] border border-gray-200 bg-white p-4">
    <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Priorytet</h3>
    {isLoading ? (
      <p className="font-segoe-ui text-[14px] leading-5 text-slate-500 antialiased animate-pulse">Ładowanie priorytetów...</p>
    ) : priorities.length === 0 ? (
      <p className="font-segoe-ui text-[14px] leading-5 text-slate-500 antialiased">Brak priorytetów.</p>
    ) : (
      <div className="flex flex-col gap-3">
        {priorities.map((priority) => {
          const isSelected = selectedPriorities[priority.id] ?? false;

          return (
            <label key={priority.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(priority.id)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900"
                aria-label={priority.name}
              />
              <span
                className="h-2 w-2 rounded-full bg-slate-300"
                style={priority.hexColor ? { backgroundColor: priority.hexColor } : undefined}
                aria-hidden="true"
              />
              <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{priority.name}</span>
            </label>
          );
        })}
      </div>
    )}
  </section>
);

const KanbanTaskCard: React.FC<{
  task: KanbanCardVM;
  isDragOverlay?: boolean;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  menuRef?: React.RefObject<HTMLDivElement | null>;
}> = ({
  task,
  isDragOverlay = false,
  isMenuOpen = false,
  onMenuToggle,
  onEdit,
  onDelete,
  menuRef,
}) => {
  const sortable = useSortable({ id: task.id, disabled: isDragOverlay });
  const style = isDragOverlay ? undefined : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };

  return (
    <article
      ref={isDragOverlay ? undefined : sortable.setNodeRef}
      style={style}
      {...(isDragOverlay ? {} : sortable.attributes)}
      {...(isDragOverlay ? {} : sortable.listeners)}
      className={`rounded-[10px] border border-slate-200 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cursor-grab active:cursor-grabbing ${isDragOverlay ? 'cursor-grabbing' : ''} ${sortable.isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate font-segoe-ui text-[14px] leading-5 font-medium tracking-[-0.15px] text-slate-900 antialiased">{task.name}</h3>
        {!isDragOverlay && (
          <div className="relative shrink-0" ref={isMenuOpen ? menuRef : undefined}>
            <button
              type="button"
              aria-label="Opcje zadania"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle?.();
              }}
              className={`rounded-md p-1 text-slate-700 transition-colors hover:bg-slate-50 ${
                isMenuOpen ? 'border border-slate-200 bg-white' : ''
              }`}
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edytuj
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  Usuń
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          className="h-2 w-2 rounded-full bg-slate-300"
          style={task.priorityHexColor ? { backgroundColor: task.priorityHexColor } : undefined}
          title={task.priorityName ?? 'Brak priorytetu'}
          aria-label={task.priorityName ?? 'Brak priorytetu'}
        />
        <div className="flex gap-2 items-center">
          <span className="font-segoe-ui text-[12px] leading-4 text-slate-500 antialiased">{task.formattedDueDate}</span>
          <div className="flex -space-x-1">
            {task.assigneesInitials.slice(0, 2).map((initials, index) => (
              <Avatar
                key={`${task.id}-${initials}-${index}`}
                initials={initials}
                size="xs"
                bgClassName="bg-scrumdone-blue-main ring-2 ring-white"
                textClassName="text-white"
              />
            ))}
            {task.assigneesInitials.length > 2 && (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 font-segoe-ui text-[10px] font-medium text-slate-600 ring-2 ring-white"
                aria-label={`+${task.assigneesInitials.length - 2} więcej przypisanych osób`}
              >
                +{task.assigneesInitials.length - 2}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const KanbanColumnView: React.FC<{
  column: KanbanColumnVm;
  openMenuTaskId: string | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onMenuToggle: (taskId: string) => void;
  onEditTask: (task: KanbanCardVM) => void;
  onDeleteTask: (task: KanbanCardVM) => void;
}> = ({ column, openMenuTaskId, menuRef, onMenuToggle, onEditTask, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section className="flex min-h-80 min-w-0 self-start flex-col gap-2">
      <header className="flex items-center gap-2">
        <span
          className="h-6 w-1 rounded-full bg-slate-400"
          style={column.accentColor ? { backgroundColor: column.accentColor } : undefined}
          aria-hidden="true"
        />
        <h3 className="min-w-0 truncate font-segoe-ui text-[16px] leading-6 font-normal text-slate-900 antialiased">{column.title}</h3>
        <span className="ml-1 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-[12px] font-medium text-slate-600 antialiased">
          {column.tasks.length}
        </span>
      </header>

      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`mt-2 flex flex-1 flex-col gap-2 rounded-lg transition-colors ${isOver ? 'bg-slate-50' : ''}`}>
          {column.tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              isMenuOpen={openMenuTaskId === task.id}
              menuRef={menuRef}
              onMenuToggle={() => onMenuToggle(task.id)}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
          {column.tasks.length === 0 && <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-lg h-24" />}
        </div>
      </SortableContext>
    </section>
  );
};

// --- Komponent Główny ---

const ProjectKanbanPage: React.FC = () => {
  const { projectId = '' } = useParams();
  const { data: project } = useProject(projectId);
  const { viewMode, setProjectViewMode } = useProjectViewMode(projectId, project?.isSetToScrum);
  const {
    data: sprintsData,
    isLoading: isSprintsLoading,
    isError: isSprintsError,
    error: sprintsError,
  } = useProjectSprints(projectId, 1, 50);
  const selectorSprints = useMemo(
    () => mapSprintSummariesToSelectorSprints(sprintsData?.items ?? []),
    [sprintsData?.items],
  );
  const { selectedSprintId, setSelectedSprintId } = useSelectedProjectSprint(
    projectId,
    selectorSprints,
  );

  const { data: statuses } = useAssignmentStatuses();
  const { data: priorities, isLoading: isPrioritiesLoading } = useAssignmentPriorities();

  const teamMembers = useMemo(
    () => mapTeamMembersToPersonFilters(project?.teamMembers ?? []),
    [project?.teamMembers],
  );

  const [selectedPriorities, setSelectedPriorities] = useState<Record<string, boolean>>({});
  const [selectedPeople, setSelectedPeople] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!priorities?.length) return;

    setSelectedPriorities((current) => {
      if (priorities.some((priority) => priority.id in current)) {
        return current;
      }

      return Object.fromEntries(priorities.map((priority) => [priority.id, true]));
    });
  }, [priorities]);

  const selectedPriorityIds = useMemo(
    () => priorities?.filter((priority) => selectedPriorities[priority.id]).map((priority) => priority.id) ?? [],
    [priorities, selectedPriorities],
  );

  const priorityList = priorities ?? [];

  const allPrioritiesSelected = !priorityList.length || priorityList.every((priority) => selectedPriorities[priority.id]);
  const noPrioritiesSelected = priorityList.length > 0 && priorityList.every((priority) => !selectedPriorities[priority.id]);

  const assignmentQuery = useMemo(() => ({
    ProjectIds: [projectId],
    Limit: 100,
    ...(!allPrioritiesSelected && !noPrioritiesSelected ? { PriorityIds: selectedPriorityIds } : {}),
  }), [
    projectId,
    allPrioritiesSelected,
    noPrioritiesSelected,
    selectedPriorityIds,
  ]);

  const { data: assignmentsData } = useAssignments(assignmentQuery);

  const peopleFilterOptions = useMemo(
    () => buildPeopleFilterOptions(teamMembers, assignmentsData?.items ?? []),
    [teamMembers, assignmentsData?.items],
  );

  const peopleFilterIds = useMemo(
    () => peopleFilterOptions.map((person) => person.id).join('|'),
    [peopleFilterOptions],
  );

  useEffect(() => {
    setSelectedPeople((current) => {
      let changed = false;
      const next = { ...current };

      for (const person of peopleFilterOptions) {
        if (!(person.id in next)) {
          next[person.id] = true;
          changed = true;
        }
      }

      for (const personId of Object.keys(next)) {
        if (!peopleFilterOptions.some((person) => person.id === personId)) {
          delete next[personId];
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [projectId, peopleFilterIds, peopleFilterOptions]);

  const allPeopleSelected = peopleFilterOptions.length === 0
    || peopleFilterOptions.every((person) => selectedPeople[person.id] === true);
  const noPeopleSelected = peopleFilterOptions.length > 0
    && peopleFilterOptions.every((person) => selectedPeople[person.id] === false);

  const selectedAssigneeIds = useMemo(
    () => peopleFilterOptions
      .filter((person) => selectedPeople[person.id] === true)
      .map((person) => person.id),
    [peopleFilterOptions, selectedPeople],
  );

  const handleSelectedPeopleChange = (next: Record<string, boolean>) => {
    setSelectedPeople(next);
  };

  const { mutate: updateStatus } = useUpdateAssignmentStatus();
  const { mutate: deleteAssignment } = useDeleteAssignment();

  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskEditDraft | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const taskMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuTaskId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (taskMenuRef.current && !taskMenuRef.current.contains(event.target as Node)) {
        setOpenMenuTaskId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuTaskId]);

  const handleMenuToggle = (taskId: string) => {
    setOpenMenuTaskId((current) => (current === taskId ? null : taskId));
  };

  const handleEditTask = (task: KanbanCardVM) => {
    if (import.meta.env.DEV) {
      console.log('[Kanban] Otwieram edycję zadania:', task.id, task.name);
    }
    const assignment = assignmentsData?.items.find((item) => item.id === task.id);
    setOpenMenuTaskId(null);
    setEditingTask({
      id: task.id,
      name: task.name,
      description: task.description,
      statusId: task.statusId,
      priorityId: task.priorityId,
      dueDate: task.dueDate ?? '',
      assigneeIds: assignment?.assignees.map((assignee) => assignee.id) ?? [],
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (task: KanbanCardVM) => {
    setOpenMenuTaskId(null);

    if (!window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
      if (import.meta.env.DEV) {
        console.log('[Kanban] Usuwanie anulowane:', task.id);
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.log('[Kanban] Usuwam zadanie:', task.id, task.name);
    }

    deleteAssignment(task.id, {
      onSuccess: () => {
        if (import.meta.env.DEV) {
          console.log('[Kanban] Usuwanie zakończone sukcesem:', task.id);
        }
      },
      onError: (error) => {
        console.error('Błąd usuwania zadania:', error);
        alert('Wystąpił błąd podczas usuwania zadania.');
      },
    });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const visibleAssignments = useMemo(() => {
    if (!assignmentsData) return [];
    if (noPrioritiesSelected || noPeopleSelected) return [];

    let items = assignmentsData.items;

    if (!allPrioritiesSelected) {
      items = items.filter((assignment) =>
        assignment.priority && selectedPriorityIds.includes(assignment.priority.id),
      );
    }

    if (!allPeopleSelected) {
      items = items.filter((assignment) =>
        matchesPeopleFilter(assignment.assignees, selectedAssigneeIds),
      );
    }

    return items;
  }, [
    assignmentsData,
    allPrioritiesSelected,
    allPeopleSelected,
    noPrioritiesSelected,
    noPeopleSelected,
    selectedPriorityIds,
    selectedAssigneeIds,
  ]);

  const columns = useMemo(() => {
    if (!statuses) return [];

    return statuses.map((status) => {
      const tasksForStatus = visibleAssignments.filter((assignment) => assignment.status.id === status.id);

      return {
        id: status.id,
        title: status.name,
        accentColor: status.hexColor,
        count: tasksForStatus.length,
        tasks: tasksForStatus.map(assignmentToKanbanCard),
      };
    });
  }, [statuses, visibleAssignments]);

  const togglePriority = (priorityId: string) => {
    setSelectedPriorities((current) => ({
      ...current,
      [priorityId]: !current[priorityId],
    }));
  };

  const [activeTask, setActiveTask] = useState<KanbanCardVM | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumnByTaskId = (taskId: string) => columns.find((col) => col.tasks.some((t) => t.id === taskId));

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeId = String(active.id);
    const sourceColumn = findColumnByTaskId(activeId);
    setActiveTask(sourceColumn?.tasks.find((t) => t.id === activeId) ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = findColumnByTaskId(activeId);
    const targetColumn = columns.find((col) => col.id === overId) ?? findColumnByTaskId(overId);

    if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) return;

    updateStatus({ id: activeId, statusId: targetColumn.id });
  };

  const renderSprintSelector = () => {
    if (isSprintsLoading) {
      return (
        <p className="font-segoe-ui text-sm text-slate-500 animate-pulse">
          Ładowanie sprintów...
        </p>
      );
    }

    if (isSprintsError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-segoe-ui text-sm text-red-700">
          Nie udało się załadować sprintów{sprintsError?.message ? `: ${sprintsError.message}` : '.'}
        </div>
      );
    }

    if (selectorSprints.length === 0) {
      return (
        <p className="font-segoe-ui text-sm text-slate-500">
          Brak sprintów w tym projekcie.
        </p>
      );
    }

    return (
      <SprintSelector
        sprints={selectorSprints}
        currentSprintId={selectedSprintId ?? ''}
        onSprintChange={setSelectedSprintId}
      />
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <TaskCreateModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        teamMembers={teamMembers}
        projectId={projectId} 
      />

      <TaskEditModal
        isOpen={isEditModalOpen}
        task={editingTask}
        teamMembers={teamMembers}
        onClose={closeEditModal}
      />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          <ProjectTopBar projectId={projectId} viewMode={viewMode} onViewModeChange={setProjectViewMode} />

          <section className="mx-6 mt-6 pb-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div className={viewMode === 'kanban' ? 'hidden' : ''}>
                        {renderSprintSelector()}
                      </div>

                      <h2 className={`font-segoe-ui text-[18px] leading-7 font-medium tracking-[-0.44px] text-slate-900 antialiased ${viewMode === 'kanban' ? '' : 'hidden'}`}>
                        Tablica Kanban
                      </h2>

                      <button
                        type="button"
                        onClick={() => setIsTaskModalOpen(true)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-scrumdone-blue-main px-4 py-2.5 font-segoe-ui text-[14px] leading-5 font-medium text-white transition-colors hover:bg-[#00A0DD]"
                      >
                        <PlusIcon className="h-4 w-4 stroke-2" />
                        Dodaj zadanie
                      </button>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCorners}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="grid items-start gap-2 xl:grid-cols-5">
                        {columns.map((column) => (
                          <KanbanColumnView
                            key={column.id}
                            column={column}
                            openMenuTaskId={openMenuTaskId}
                            menuRef={taskMenuRef}
                            onMenuToggle={handleMenuToggle}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                          />
                        ))}
                      </div>

                      <DragOverlay>
                        {activeTask ? <KanbanTaskCard task={activeTask} isDragOverlay /> : null}
                      </DragOverlay>
                    </DndContext>
                  </div>

                  <aside className="flex flex-col gap-4">
                    <PriorityFilterCard
                      priorities={priorities ?? []}
                      selectedPriorities={selectedPriorities}
                      onToggle={togglePriority}
                      isLoading={isPrioritiesLoading}
                    />
                    <CalendarPeopleFilter
                      people={peopleFilterOptions}
                      selectedPeople={selectedPeople}
                      onSelectedPeopleChange={handleSelectedPeopleChange}
                    />
                  </aside>
                </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProjectKanbanPage;