import { format } from 'date-fns';
import type { Assignment } from '../types/assignment';
import { getInitialsFromName } from '../hooks/useCurrentUser';

export type AssignmentVM = {
  id: string;
  name: string;
  description: string;
  statusName: string;
  priorityName: string | null;
  statusHexColor: string;
  priorityHexColor: string | null;
  assigneesInitials: string[];
  formattedDueDate: string;
  sprintId: string | null;
};

export const mapAssignmentToVM = (a: Assignment): AssignmentVM => {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    statusName: a.status.name,
    priorityName: a.priority?.name ?? null,
    statusHexColor: a.status.hexColor,
    priorityHexColor: a.priority?.hexColor ?? null,
    assigneesInitials: a.assignees.map(u => getInitialsFromName(u.name)),
    formattedDueDate: a.dueDate ? format(new Date(a.dueDate), 'dd-MM-yyyy') : 'No date',
    sprintId: a.sprintId,
  };
};

export const assignmentToKanbanCard = (a: Assignment) => {
  const vm = mapAssignmentToVM(a);
  const dueDate = a.dueDate ? a.dueDate.split('T')[0] : '';

  return {
    ...vm,
    statusId: a.status.id,
    priorityId: a.priority?.id ?? '',
    dueDate,
    shortDescription: (vm.description ?? '').slice(0, 50) + '...',
  };
};

export const assignmentToCalendarTask = (a: Assignment) => {
  const date = a.dueDate ? format(new Date(a.dueDate), 'yyyy-MM-dd') : ''
  return {
    id: a.id,
    title: a.name,
    date,
    colorVariant: 'blue' as const,
    priorityHexColor: a.priority?.hexColor ?? null,
  }
};

export const assignmentToNoDeadlineTask = (a: Assignment) => {
  // Kolor zapasowy, gdy priorytet nie ma hexColor
  const fallbackColor = a.priority?.name === 'High' ? 'red' as const : 'blue' as const

  return {
    id: a.id,
    title: a.name,
    assigneeInitials: a.assignees[0]?.name ? getInitialsFromName(a.assignees[0].name) : '??',
    assigneeName: a.assignees[0]?.name ?? 'Unassigned',
    accentColor: fallbackColor,
    dotColor: fallbackColor,
    priorityHexColor: a.priority?.hexColor ?? null,
  }
};


