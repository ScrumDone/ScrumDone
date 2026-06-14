import { format } from 'date-fns';
import type { Assignment } from '../types/assignment';
import { getInitialsFromName } from '../hooks/useCurrentUser';

export type SprintTaskItem = {
  id: string;
  name: string;
  assigneeInitials: string;
  assigneeName: string;
  assigneeId: string | null;
  priorityId: string | null;
  priorityHexColor: string | null;
  status: 'Ukończone' | 'Nieukończone';
  daysLeft: string;
};

export type SprintBacklogTask = {
  id: string;
  name: string;
  assigneeInitials: string;
  assigneeName: string;
  priorityHexColor: string | null;
};

const formatTaskDueDate = (dueDate: string | null): string => {
  if (!dueDate) {
    return '—';
  }

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return format(date, 'dd-MM-yyyy');
};

const isAssignmentDone = (assignment: Assignment) => assignment.status.name === 'Done';

export const mapAssignmentToSprintTaskItem = (assignment: Assignment): SprintTaskItem => {
  const primaryAssignee = assignment.assignees[0];

  return {
    id: assignment.id,
    name: assignment.name,
    assigneeInitials: primaryAssignee ? getInitialsFromName(primaryAssignee.name) : '??',
    assigneeName: primaryAssignee?.name ?? 'Nieprzypisane',
    assigneeId: primaryAssignee?.id ?? null,
    priorityId: assignment.priority?.id ?? null,
    priorityHexColor: assignment.priority?.hexColor ?? null,
    status: isAssignmentDone(assignment) ? 'Ukończone' : 'Nieukończone',
    daysLeft: formatTaskDueDate(assignment.dueDate),
  };
};

export const mapAssignmentToSprintBacklogTask = (assignment: Assignment): SprintBacklogTask => {
  const primaryAssignee = assignment.assignees[0];

  return {
    id: assignment.id,
    name: assignment.name,
    assigneeInitials: primaryAssignee ? getInitialsFromName(primaryAssignee.name) : '??',
    assigneeName: primaryAssignee?.name ?? 'Nieprzypisane',
    priorityHexColor: assignment.priority?.hexColor ?? null,
  };
};

export const sprintBacklogToTaskItem = (task: SprintBacklogTask): SprintTaskItem => ({
  id: task.id,
  name: task.name,
  assigneeInitials: task.assigneeInitials,
  assigneeName: task.assigneeName,
  assigneeId: null,
  priorityId: null,
  priorityHexColor: task.priorityHexColor,
  status: 'Nieukończone',
  daysLeft: '—',
});

export const sprintTaskItemToBacklog = (task: SprintTaskItem): SprintBacklogTask => ({
  id: task.id,
  name: task.name,
  assigneeInitials: task.assigneeInitials,
  assigneeName: task.assigneeName,
  priorityHexColor: task.priorityHexColor,
});

export const matchesSprintCompletionFilter = (
  assignment: Assignment,
  selectedStatuses: Record<string, boolean>,
) => {
  const doneSelected = selectedStatuses.ukonczne !== false;
  const notDoneSelected = selectedStatuses.nieukonczne !== false;

  if (!doneSelected && !notDoneSelected) {
    return false;
  }

  const isDone = isAssignmentDone(assignment);

  if (doneSelected && notDoneSelected) {
    return true;
  }

  return doneSelected ? isDone : !isDone;
};
