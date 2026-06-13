import React, { useMemo, useState } from 'react';
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import Avatar from '../components/Avatar';
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter';
import SprintSelector from '../components/SprintSelector';
import TaskCreateModal from '../components/TaskCreateModal';
import { useProjectSprints } from '../hooks/useProjectSprints';
import { useProjectViewMode } from '../hooks/useProjectViewMode';
import { useSelectedProjectSprint } from '../hooks/useSelectedProjectSprint';
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
import { useAssignments } from '../hooks/useAssignments';
import { useUpdateAssignmentStatus } from '../hooks/useUpdateAssignmentStatus';
import {assignmentToKanbanCard} from '../lib/assignmentMappers';

// --- Typy i Dane pomocnicze ---

type KanbanCardVM = ReturnType<typeof assignmentToKanbanCard>;

type KanbanColumnVm = {
  id: string;
  title: string;
  accentClass: string;
  count: number;
  tasks: KanbanCardVM[];
}

type PriorityOption = {
  id: string;
  label: string;
  colorClass: string;
};

//Task: Connect project kanban board to assignments API #233

//type TaskDotColor = 'red' | 'yellow' | 'green' | 'blue';

// type KanbanTask = {
//   id: string;
//   title: string;
//   assigneeInitials: string;
//   assigneeName: string;
//   dateLabel: string;
//   dotColor: TaskDotColor;
// };

// type KanbanColumn = {
//   id: string;
//   title: string;
//   accentClass: string;
//   count: number;
//   tasks: KanbanTask[];
// };

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

//Task: Connect project kanban board to assignments API #233

// const taskDotClassMap: Record<TaskDotColor, string> = {
//   red: 'bg-scrumdone-red-500',
//   yellow: 'bg-scrumdone-yellow-500',
//   green: 'bg-scrumdone-green-500',
//   blue: 'bg-scrumdone-blue-main',
// };

// const initialKanbanColumns: KanbanColumn[] = [
//   { id: 'todo', title: 'Do zrobienia', accentClass: 'bg-slate-400', count: 0, tasks: [] },
//   {
//     id: 'in-progress',
//     title: 'W toku',
//     accentClass: 'bg-scrumdone-blue-main',
//     count: 1,
//     tasks: [
//       { id: 'cicd-pipeline', title: 'CI/CD pipeline', assigneeInitials: 'AN', assigneeName: 'Artur Nowak', dateLabel: '05 lut', dotColor: 'green' },
//     ],
//   },
//   { id: 'review', title: 'Sprawdzanie', accentClass: 'bg-scrumdone-yellow-500', count: 0, tasks: [] },
//   {
//     id: 'done',
//     title: 'Gotowe',
//     accentClass: 'bg-scrumdone-green-500',
//     count: 3,
//     tasks: [
//       { id: 'project-init', title: 'Project initialization', assigneeInitials: 'AN', assigneeName: 'Artur Nowak', dateLabel: '22 sty', dotColor: 'red' },
//       { id: 'git-setup', title: 'Git repository setup', assigneeInitials: 'EB', assigneeName: 'Eryk Baczyński', dateLabel: '25 sty', dotColor: 'yellow' },
//       { id: 'dev-env', title: 'Development environment', assigneeInitials: 'MK', assigneeName: 'Maria Kowalska', dateLabel: '01 lut', dotColor: 'red' },
//     ],
//   },
//   { id: "blocked", title: 'Zablokowane', accentClass: 'bg-scrumdone-red-500', count: 0, tasks: [] },
// ];

// --- Komponenty Wewnętrzne ---

const PriorityFilterCard: React.FC = () => (
  <section className="rounded-[10px] border border-gray-200 bg-white p-4">
    <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Priorytet</h3>
    <div className="flex flex-col gap-3">
      {priorityOptions.map((option) => (
        <label key={option.id} className="flex items-center gap-2">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900 aria-label={option.label}" />
          <span className={`h-2 w-2 rounded-full ${option.colorClass}`} />
          <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{option.label}</span>
        </label>
      ))}
    </div>
  </section>
);

const KanbanTaskCard: React.FC<{ task: KanbanCardVM; isDragOverlay?: boolean }> = ({ task, isDragOverlay = false }) => {
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
        <button type="button" className="rounded-full p-1 text-slate-700 hover:bg-slate-50">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`h-2 w-2 rounded-full ${task.statusColorClass}`} aria-hidden="true" />
        <div className="flex gap-2 items-center">
          <span className="font-segoe-ui text-[12px] leading-4 text-slate-500 antialiased">{task.formattedDueDate}</span>
          <Avatar initials={task.assigneesInitials[0] ?? '??'} size="xs" bgClassName="bg-scrumdone-blue-main" textClassName="text-white" />
        </div>
      </div>
    </article>
  );
};

const KanbanColumnView: React.FC<{ column: KanbanColumnVm }> = ({ column }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section className="flex min-h-80 min-w-0 self-start flex-col gap-2">
      <header className="flex items-center gap-2">
        <span className={`h-6 w-1 rounded-full ${column.accentClass}`} aria-hidden="true" />
        <h3 className="min-w-0 truncate font-segoe-ui text-[16px] leading-6 font-normal text-slate-900 antialiased">{column.title}</h3>
        <span className="ml-1 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-[12px] font-medium text-slate-600 antialiased">
          {column.tasks.length}
        </span>
      </header>

      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`mt-2 flex flex-1 flex-col gap-2 rounded-lg transition-colors ${isOver ? 'bg-slate-50' : ''}`}>
          {column.tasks.map((task) => <KanbanTaskCard key={task.id} task={task} />)}
          {column.tasks.length === 0 && <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-lg h-24" />}
        </div>
      </SortableContext>
    </section>
  );
};

// --- Komponent Główny ---

const ProjectKanbanPage: React.FC = () => {
  const { projectId = '' } = useParams();
  const { viewMode, setProjectViewMode } = useProjectViewMode(projectId);
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

  const { data: statuses} = useAssignmentStatuses(); 
  const { data: assignmentsData} = useAssignments({ ProjectIds: [projectId]})
  const { mutate: updateStatus } = useUpdateAssignmentStatus();

  const columns = useMemo(() => {
    if (!statuses || !assignmentsData) return [];
    
    return statuses.map((status) => {
      // Filtrujemy zadania dla danego statusu
      const tasksForStatus = assignmentsData.items.filter((a) => a.status.id === status.id);
      
      return {
        id: status.id, // ID statusu z API
        title: status.name, // Nazwa statusu z API
        accentClass: 'bg-slate-400', // Tutaj możesz dodać logikę używającą status.hexColor
        count: tasksForStatus.length,
        // Używamy Twojego mappera zamiast ręcznego mapowania:
        tasks: tasksForStatus.map(assignmentToKanbanCard) 
      };
    });
  }, [statuses, assignmentsData]);

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

  //Task: Connect project kanban board to assignments API #233
  // const handleDragEnd = ({ active, over }: DragEndEvent) => {
  //   setActiveTask(null);
  //   if (!over) return;

  //   const activeId = String(active.id);
  //   const overId = String(over.id);

  //   const sourceColumn = findColumnByTaskId(activeId);
  //   const targetColumn = columns.find((col) => col.id === overId) ?? findColumnByTaskId(overId);

  //   if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) return;

  //   const taskToMove = sourceColumn.tasks.find((t) => t.id === activeId);
  //   if (!taskToMove) return;

  //   setColumns((prev) =>
  //     prev.map((col) => {
  //       if (col.id === sourceColumn.id) return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
  //       if (col.id === targetColumn.id) return { ...col, tasks: [...col.tasks, taskToMove] };
  //       return col;
  //     })
  //   );
  // };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Jeśli upuszczono na kolumnę (overId jest ID kolumny)
    if (activeId !== overId) {
      updateStatus({ id: activeId, statusId: overId });
    }
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
                          <KanbanColumnView key={column.id} column={column} />
                        ))}
                      </div>

                      <DragOverlay>
                        {activeTask ? <KanbanTaskCard task={activeTask} isDragOverlay /> : null}
                      </DragOverlay>
                    </DndContext>
                  </div>

                  <aside className="flex flex-col gap-4">
                    <PriorityFilterCard />
                    <CalendarPeopleFilter people={teamMembers} />
                  </aside>
                </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProjectKanbanPage;