import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAssignments } from '../api/assignments';
import { ASSIGNMENTS_STALE_TIME } from './useAssignments';
import { ApiError } from '../api/client';
import type { Assignment, AssignmentQueryParams } from '../types/assignment';
import { getCalendarRange, type CalendarView } from '../lib/calendarRange';

type CalendarAssignmentFilters = Pick<AssignmentQueryParams, 'ProjectIds' | 'AssigneeIds' | 'PriorityIds'>;

const PAGE_SIZE = 100;

// Pobiera wszystkie strony, żeby szerszy zakres miesiąca nie obcinał zadań widocznych w tygodniu
const getAllAssignmentsInRange = async (params: AssignmentQueryParams) => {
  const items: Assignment[] = [];
  let page = 1;

  while (true) {
    const response = await getAssignments({ ...params, Page: page, Limit: PAGE_SIZE });
    items.push(...response.items);
    if (!response.hasNextPage) return items;
    page += 1;
  }
};

// Jedno źródło danych dla widoku tygodniowego i miesięcznego
export function useCalendarAssignments(
  view: CalendarView,
  anchorDate: Date,
  filters: CalendarAssignmentFilters,
  enabled = true,
) {
  const range = useMemo(() => getCalendarRange(view, anchorDate), [view, anchorDate]);

  const params: AssignmentQueryParams = {
    ...filters,
    ExcludeNoDeadline: true,
    DueFrom: range.dueFrom,
    DueTo: range.dueTo,
  };

  const query = useQuery<Assignment[], ApiError>({
    queryKey: ['assignments', 'calendar', params],
    queryFn: () => getAllAssignmentsInRange(params),
    enabled,
    staleTime: ASSIGNMENTS_STALE_TIME,
  });

  return { ...query, range };
}
