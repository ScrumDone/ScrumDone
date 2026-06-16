import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter';
import SprintSelector from '../components/SprintSelector';
import TaskCreateModal from '../components/TaskCreateModal';
import TaskEditModal, { type TaskEditDraft } from '../components/TaskEditModal';
import KanbanColumnContainer from '../components/KanbanColumnContainer';
import { KanbanTaskCard, type KanbanCardVM } from '../components/KanbanTaskCard';
import { useProjectSprints } from '../hooks/useProjectSprints';
import { useCurrentProjectSprint } from '../hooks/useCurrentProjectSprint';
import { useProjectBoardSprint } from '../hooks/useProjectBoardSprint';
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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useAssignmentStatuses } from '../hooks/useAssignmentStatuses';
import { useAssignmentPriorities } from '../hooks/useAssignmentPriorities';
import { useAssignments } from '../hooks/useAssignments';
import { useUpdateAssignmentStatus } from '../hooks/useUpdateAssignmentStatus';
import { useDeleteAssignment } from '../hooks/useDeleteAssignment';
import { assignmentToKanbanCard } from '../lib/assignmentMappers';
import { findKanbanAssignment, findKanbanStatusIdForTask } from '../utils/kanbanAssignmentCache';
import type { Assignment, AssignmentPriority } from '../types/assignment';

// --- Typy i Dane pomocnicze ---

const mapTeamMembersToPersonFilters = (members: { id: string; name: string }[]): PersonFilter[] =>
  members.map((member) => ({
    id: member.id,
    initials: getInitialsFromName(member.name),
    fullName: member.name,
  }));

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

// --- Komponent Główny ---

const ProjectKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projectId = '' } = useParams();
  const { data: project } = useProject(projectId);
  const isScrumProject = project?.isSetToScrum ?? false;
  const {
    data: currentSprint,
  } = useCurrentProjectSprint(projectId);
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

  const { selectedSprintId, setSelectedSprintId } = useProjectBoardSprint(
    projectId,
    currentSprint?.id,
  );

  const boardSprintId = selectedSprintId;
  const isBoardSprintReady = Boolean(boardSprintId);

  const { data: statuses } = useAssignmentStatuses();
  const { data: priorities, isLoading: isPrioritiesLoading } = useAssignmentPriorities();
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
  const [optimisticSnapshots, setOptimisticSnapshots] = useState<Record<string, Assignment>>({});

  useEffect(() => {
    setOptimisticStatuses({});
    setOptimisticSnapshots({});
    queryClient.removeQueries({ queryKey: ['assignments'] });
  }, [isScrumProject, projectId, queryClient]);


  const teamMembers = useMemo(
    () => mapTeamMembersToPersonFilters(project?.teamMembers ?? []),
    [project?.teamMembers],
  );

  const [selectedPriorities, setSelectedPriorities] = useState<Record<string, boolean>>({});
  const [selectedPeople, setSelectedPeople] = useState<Record<string, boolean>>({});

  const handleTaskClick = (task: KanbanCardVM) => {
    navigate(`/task/${task.id}`);
  };

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

  const { data: peopleSourceData } = useAssignments({
    ProjectIds: [projectId],
    Limit: 50,
  });

  const peopleFilterOptions = useMemo(
    () => buildPeopleFilterOptions(teamMembers, peopleSourceData?.items ?? []),
    [teamMembers, peopleSourceData?.items],
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

  const kanbanBaseQuery = useMemo(() => ({
    ProjectIds: [projectId],
    ...(boardSprintId ? { SprintIds: [boardSprintId] } : {}),
    ...(!allPrioritiesSelected && !noPrioritiesSelected ? { PriorityIds: selectedPriorityIds } : {}),
    ...(!allPeopleSelected && !noPeopleSelected ? { AssigneeIds: selectedAssigneeIds } : {}),
  }), [
    projectId,
    boardSprintId,
    allPrioritiesSelected,
    noPrioritiesSelected,
    selectedPriorityIds,
    allPeopleSelected,
    noPeopleSelected,
    selectedAssigneeIds,
  ]);

  const kanbanColumnsEnabled = Boolean(projectId)
    && isBoardSprintReady
    && !noPrioritiesSelected
    && !noPeopleSelected;

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

  const handleEditTask = (task: KanbanCardVM, assignment: Assignment) => {
    if (import.meta.env.DEV) {
      console.log('[Kanban] Otwieram edycję zadania:', task.id, task.name);
    }
    setOpenMenuTaskId(null);
    setEditingTask({
      id: task.id,
      name: task.name,
      description: task.description,
      statusId: task.statusId,
      priorityId: task.priorityId,
      dueDate: task.dueDate ?? '',
      assigneeIds: assignment.assignees.map((assignee) => assignee.id),
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

  const [activeTask, setActiveTask] = useState<KanbanCardVM | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resolveTargetStatusId = (overId: string) => {
    if (statuses?.some((status) => status.id === overId)) {
      return overId;
    }

    return findKanbanStatusIdForTask(queryClient, overId, optimisticStatuses);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeId = String(active.id);
    const assignment = findKanbanAssignment(queryClient, activeId) ?? optimisticSnapshots[activeId];

    if (assignment) {
      setOptimisticSnapshots((current) => ({ ...current, [activeId]: assignment }));
      setActiveTask(assignmentToKanbanCard(assignment));
      return;
    }

    setActiveTask(null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceStatusId = findKanbanStatusIdForTask(queryClient, activeId, optimisticStatuses);
    const targetStatusId = resolveTargetStatusId(overId);

    if (!sourceStatusId || !targetStatusId || sourceStatusId === targetStatusId) return;

    const snapshot = optimisticSnapshots[activeId] ?? findKanbanAssignment(queryClient, activeId);
    if (snapshot) {
      setOptimisticSnapshots((current) => ({ ...current, [activeId]: snapshot }));
    }

    setOptimisticStatuses((prev) => ({ ...prev, [activeId]: targetStatusId }));

    updateStatus(
      { id: activeId, statusId: targetStatusId },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['assignments'] });

          setOptimisticStatuses((prev) => {
            const next = { ...prev };
            delete next[activeId];
            return next;
          });
        },
        onError: (error) => {
          setOptimisticStatuses((prev) => {
            const next = { ...prev };
            delete next[activeId];
            return next;
          });
          console.error('Błąd przenoszenia zadania:', error);
          alert('Nie udało się przenieść zadania na serwerze. Karta wróci na swoje miejsce.');
        },
      }
    );
  };

  const togglePriority = (priorityId: string) => {
    setSelectedPriorities((current) => ({
      ...current,
      [priorityId]: !current[priorityId],
    }));
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
        defaultSprintId={boardSprintId}
      />

      <TaskEditModal
        isOpen={isEditModalOpen}
        task={editingTask}
        teamMembers={teamMembers}
        onClose={closeEditModal}
      />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          <ProjectTopBar projectId={projectId} />

          <section className="mx-6 mt-6 pb-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div className={isScrumProject ? '' : 'hidden'}>
                        {renderSprintSelector()}
                      </div>

                      <h2 className={`font-segoe-ui text-[18px] leading-7 font-medium tracking-[-0.44px] text-slate-900 antialiased ${isScrumProject ? 'hidden' : ''}`}>
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

                    {!isBoardSprintReady ? (
                      <p className="py-12 text-center font-segoe-ui text-sm text-slate-500 animate-pulse">
                        Ładowanie sprintu...
                      </p>
                    ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCorners}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragCancel={() => setActiveTask(null)}
                    >
                      <div className="grid items-start gap-2 xl:grid-cols-5">
                        {(statuses ?? []).map((status) => (
                          <KanbanColumnContainer
                            key={status.id}
                            statusId={status.id}
                            title={status.name}
                            accentColor={status.hexColor}
                            baseQuery={kanbanBaseQuery}
                            enabled={kanbanColumnsEnabled}
                            optimisticStatuses={optimisticStatuses}
                            optimisticSnapshots={optimisticSnapshots}
                            openMenuTaskId={openMenuTaskId}
                            menuRef={taskMenuRef}
                            onMenuToggle={handleMenuToggle}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            onTaskClick={handleTaskClick}
                          />
                        ))}
                      </div>

                      <DragOverlay dropAnimation={null}>
                        {activeTask ? <KanbanTaskCard task={activeTask} isDragOverlay /> : null}
                      </DragOverlay>
                    </DndContext>
                    )}
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
