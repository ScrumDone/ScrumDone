import { format } from 'date-fns';
import type { Assignment } from '../types/assignment';
import { getInitialsFromName } from '../hooks/useCurrentUser';

export type AssignmentVM = {
  id: string;
  name: string;
  description: string;
  statusName: string;
  priorityName: string;
  statusColorClass: string; 
  priorityColorClass: string;
  assigneesInitials: string[];
  formattedDueDate: string;
};

export const mapAssignmentToVM = (a: Assignment): AssignmentVM => {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    statusName: a.status.name,
    priorityName: a.priority.name,
    // Zakładamy, że hexColor mapujemy na klasę lub używamy arbitralnej wartości (JIT)
    statusColorClass: `bg-[${a.status.hexColor}]`,
    priorityColorClass: `text-[${a.priority.hexColor}]`,
    assigneesInitials: a.assignees.map(u => getInitialsFromName(u.name)),
    formattedDueDate: a.dueDate ? format(new Date(a.dueDate), 'dd-MM-yyyy') : 'No date',
  };
};

export const assignmentToKanbanCard = (a: Assignment) => {
  const vm = mapAssignmentToVM(a);
  return {
    ...vm,
    // Tu możesz dodać logikę specyficzną tylko dla KanbanCard, 
    // np. skrócony opis, który jest wymagany w widoku kolumn
    shortDescription: vm.description.slice(0, 50) + '...',
  };
};

export const assignmentToCalendarTask = (a: Assignment) => {
  const vm = mapAssignmentToVM(a);
  return {
    ...vm,
    // Tu format daty dla kalendarza może wymagać innej logiki, 
    // np. godziny (HH:mm)
    calendarDate: a.dueDate ? format(new Date(a.dueDate), 'HH:mm') : null,
  };
};


