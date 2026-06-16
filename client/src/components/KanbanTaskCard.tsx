import React from 'react';
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Avatar from './Avatar';
import { assignmentToKanbanCard } from '../lib/assignmentMappers';

export type KanbanCardVM = ReturnType<typeof assignmentToKanbanCard>;

export const KanbanTaskCard: React.FC<{
  task: KanbanCardVM;
  isDragOverlay?: boolean;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  onClick?: () => void;
}> = ({
  task,
  isDragOverlay = false,
  isMenuOpen = false,
  onMenuToggle,
  onEdit,
  onDelete,
  menuRef,
  onClick,
}) => {
  const sortable = useSortable({ id: task.id, disabled: isDragOverlay });
  const style = isDragOverlay ? undefined : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };

  return (
    <article
      ref={isDragOverlay ? undefined : sortable.setNodeRef}
      style={style}
      {...(isDragOverlay ? {} : sortable.attributes)}
      {...(isDragOverlay ? {} : sortable.listeners)}
      onClick={onClick}
      className={`rounded-[10px] border border-slate-200 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] cursor-grab active:cursor-grabbing ${isDragOverlay ? 'w-full box-border cursor-grabbing' : ''} ${sortable.isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate font-segoe-ui text-[14px] leading-5 font-medium tracking-[-0.15px] text-slate-900 antialiased">{task.name}</h3>
        <div
          className={`relative shrink-0 ${isDragOverlay ? 'pointer-events-none' : ''}`}
          ref={!isDragOverlay && isMenuOpen ? menuRef : undefined}
        >
          <button
            type="button"
            aria-label="Opcje zadania"
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            tabIndex={isDragOverlay ? -1 : undefined}
            onPointerDown={(e) => {
              if (!isDragOverlay) e.stopPropagation();
            }}
            onClick={(e) => {
              if (isDragOverlay) return;
              e.stopPropagation();
              onMenuToggle?.();
            }}
            className={`rounded-md p-1 text-slate-700 transition-colors hover:bg-slate-50 ${
              isMenuOpen && !isDragOverlay ? 'border border-slate-200 bg-white' : ''
            } ${isDragOverlay ? 'invisible' : ''}`}
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </button>

          {!isDragOverlay && isMenuOpen && (
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
