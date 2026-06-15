import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KANBAN_COLUMN_PAGE_SIZE, useKanbanColumnAssignments } from '../hooks/useAssignments';
import { assignmentToKanbanCard } from '../lib/assignmentMappers';
import type { Assignment, AssignmentQueryParams } from '../types/assignment';
import { KanbanTaskCard } from './KanbanTaskCard';

type KanbanCardVM = ReturnType<typeof assignmentToKanbanCard>;

type KanbanColumnContainerProps = {
  statusId: string;
  title: string;
  accentColor: string;
  baseQuery: AssignmentQueryParams;
  enabled: boolean;
  optimisticStatuses: Record<string, string>;
  optimisticSnapshots: Record<string, Assignment>;
  openMenuTaskId: string | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onMenuToggle: (taskId: string) => void;
  onEditTask: (task: KanbanCardVM, assignment: Assignment) => void;
  onDeleteTask: (task: KanbanCardVM) => void;
  onTaskClick: (task: KanbanCardVM) => void;
};

const KanbanColumnContainer: React.FC<KanbanColumnContainerProps> = ({
  statusId,
  title,
  accentColor,
  baseQuery,
  enabled,
  optimisticStatuses,
  optimisticSnapshots,
  openMenuTaskId,
  menuRef,
  onMenuToggle,
  onEditTask,
  onDeleteTask,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: statusId });
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useKanbanColumnAssignments(statusId, baseQuery, enabled);

  const loadedAssignments = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const totalCount = Number(data?.pages[0]?.totalCount ?? 0);

  const tasks = useMemo(() => {
    const byId = new Map<string, Assignment>();

    for (const assignment of loadedAssignments) {
      const effectiveStatusId = optimisticStatuses[assignment.id] ?? assignment.status.id;
      if (effectiveStatusId === statusId) {
        byId.set(assignment.id, assignment);
      }
    }

    for (const [assignmentId, targetStatusId] of Object.entries(optimisticStatuses)) {
      if (targetStatusId !== statusId || byId.has(assignmentId)) {
        continue;
      }

      const snapshot = optimisticSnapshots[assignmentId];
      if (snapshot) {
        byId.set(assignmentId, snapshot);
      }
    }

    return Array.from(byId.values()).map(assignmentToKanbanCard);
  }, [loadedAssignments, optimisticSnapshots, optimisticStatuses, statusId]);

  const showPagedCount = hasNextPage || totalCount > KANBAN_COLUMN_PAGE_SIZE;
  const countLabel = showPagedCount ? `${tasks.length}/${totalCount}` : String(tasks.length);

  return (
    <section className="flex min-h-80 min-w-0 self-start flex-col gap-2">
      <header className="flex items-center gap-2">
        <span
          className="h-6 w-1 rounded-full bg-slate-400"
          style={accentColor ? { backgroundColor: accentColor } : undefined}
          aria-hidden="true"
        />
        <h3 className="min-w-0 truncate font-segoe-ui text-[16px] leading-6 font-normal text-slate-900 antialiased">
          {title}
        </h3>
        <span
          className="ml-1 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-[12px] font-medium text-slate-600 antialiased"
          title={showPagedCount ? `Wyświetlono ${tasks.length} z ${totalCount} zadań` : undefined}
        >
          {countLabel}
        </span>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`mt-2 flex flex-1 flex-col gap-2 rounded-lg transition-colors ${isOver ? 'bg-slate-50' : ''}`}
        >
          {isLoading && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-6 text-center font-segoe-ui text-sm text-slate-500 animate-pulse">
              Ładowanie zadań...
            </div>
          )}

          {!isLoading && tasks.map((task) => {
            const assignment = optimisticSnapshots[task.id]
              ?? loadedAssignments.find((item) => item.id === task.id);

            return (
              <KanbanTaskCard
                key={task.id}
                task={task}
                isMenuOpen={openMenuTaskId === task.id}
                menuRef={menuRef}
                onMenuToggle={() => onMenuToggle(task.id)}
                onEdit={() => assignment && onEditTask(task, assignment)}
                onDelete={() => onDeleteTask(task)}
                onClick={() => onTaskClick(task)}
              />
            );
          })}

          {!isLoading && tasks.length === 0 && (
            <div className="h-24 rounded-lg border-2 border-dashed border-slate-100 bg-slate-50/50" />
          )}

          {!isLoading && hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-segoe-ui text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetchingNextPage ? 'Ładowanie...' : 'Pokaż więcej'}
            </button>
          )}
        </div>
      </SortableContext>
    </section>
  );
};

export default KanbanColumnContainer;
