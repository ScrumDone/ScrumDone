import type { Assignment } from '../types/assignment';

const dueTime = (dueDate: string | null): number | null => {
  if (!dueDate) return null;
  const time = Date.parse(dueDate);
  return Number.isNaN(time) ? null : time;
};

// Ta sama kolejność co GET /assignments: termin rosnąco (puste na końcu), potem priorytet malejąco.
export const compareAssignments = (a: Assignment, b: Assignment): number => {
  const aTime = dueTime(a.dueDate);
  const bTime = dueTime(b.dueDate);

  if (aTime === null && bTime !== null) return 1;
  if (aTime !== null && bTime === null) return -1;
  if (aTime !== null && bTime !== null && aTime !== bTime) return aTime - bTime;

  const aPriority = a.priority?.order ?? 0;
  const bPriority = b.priority?.order ?? 0;
  return bPriority - aPriority;
};

export const insertAssignmentSorted = (items: Assignment[], assignment: Assignment): Assignment[] => {
  const without = items.filter((item) => item.id !== assignment.id);
  const index = without.findIndex((item) => compareAssignments(assignment, item) < 0);
  const next = [...without];
  next.splice(index === -1 ? next.length : index, 0, assignment);
  return next;
};
