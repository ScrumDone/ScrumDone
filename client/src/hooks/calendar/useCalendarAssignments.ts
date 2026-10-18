import { useMemo } from 'react';
import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import { getAssignments } from '../../api/assignments';
import { ASSIGNMENTS_STALE_TIME } from '../assignments/useAssignments';
import { ApiError } from '../../api/client';
import type { AssignmentQueryParams, PaginatedAssignmentsResponse } from '../../types/assignment';
import { getCalendarRange, getDayRange, toDayKey, type CalendarView } from '../../lib/calendarRange';

export type CalendarAssignmentFilters = Pick<AssignmentQueryParams, 'ProjectIds' | 'AssigneeIds' | 'PriorityIds'>;

// Liczba zadań pobieranych dla całego widoku; więcej oznacza, że część dni pokaże "+N więcej"
export const CALENDAR_PAGE_SIZE = 100;
const DAY_TASKS_PAGE_SIZE = 50;

const toDayKeyFromDueDate = (dueDate: string) => toDayKey(new Date(dueDate));

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
    Page: 1,
    Limit: CALENDAR_PAGE_SIZE,
  };

  const query = useQuery<PaginatedAssignmentsResponse, ApiError>({
    queryKey: ['assignments', 'calendar', params],
    queryFn: () => getAssignments(params),
    enabled,
    staleTime: ASSIGNMENTS_STALE_TIME,
  });

  // Backend sortuje po dueDate rosnąco, więc przy obciętej liście dni przed ostatnim
  // wczytanym dniem są kompletne. Niepełne mogą być tylko: ten dzień i wszystkie późniejsze.
  const incompleteDayKeys = useMemo(() => {
    const page = query.data;
    if (!page?.hasNextPage) return [];

    const lastDueDate = page.items[page.items.length - 1]?.dueDate;
    if (!lastDueDate) return [];

    const cutoffKey = toDayKeyFromDueDate(lastDueDate);
    return range.days.map(toDayKey).filter((dayKey) => dayKey >= cutoffKey);
  }, [query.data, range.days]);

  // Dla niepełnych dni pytamy tylko o totalCount (Limit = 1), żeby wiedzieć, ile zadań brakuje
  const dayTotalQueries = useQueries({
    queries: incompleteDayKeys.map((dayKey) => {
      const { dueFrom, dueTo } = getDayRange(dayKey);
      const dayParams: AssignmentQueryParams = {
        ...filters,
        ExcludeNoDeadline: true,
        DueFrom: dueFrom,
        DueTo: dueTo,
        Page: 1,
        Limit: 1,
      };

      return {
        queryKey: ['assignments', 'calendar-day-count', dayParams],
        queryFn: () => getAssignments(dayParams),
        enabled,
        staleTime: ASSIGNMENTS_STALE_TIME,
      };
    }),
  });

  const dayTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    incompleteDayKeys.forEach((dayKey, index) => {
      const totalCount = dayTotalQueries[index]?.data?.totalCount;
      if (totalCount !== undefined) {
        totals[dayKey] = Number(totalCount);
      }
    });
    return totals;
  }, [incompleteDayKeys, dayTotalQueries]);

  return {
    ...query,
    data: query.data?.items,
    totalCount: query.data ? Number(query.data.totalCount) : undefined,
    hasNextPage: query.data?.hasNextPage ?? false,
    // Liczba wszystkich zadań w dniu – tylko dla dni, które mogą nie być w pełni wczytane
    dayTotals,
    range,
  };
}

// Pełna lista zadań jednego dnia, doładowywana stronami (okno "+N więcej")
export function useCalendarDayAssignments(
  dayKey: string | null,
  filters: CalendarAssignmentFilters,
) {
  const dayParams: AssignmentQueryParams = dayKey
    ? {
      ...filters,
      ExcludeNoDeadline: true,
      DueFrom: getDayRange(dayKey).dueFrom,
      DueTo: getDayRange(dayKey).dueTo,
      Limit: DAY_TASKS_PAGE_SIZE,
    }
    : {};

  return useInfiniteQuery<PaginatedAssignmentsResponse, ApiError>({
    queryKey: ['assignments', 'calendar-day', dayParams],
    queryFn: ({ pageParam }) => getAssignments({ ...dayParams, Page: Number(pageParam) }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? Number(lastPage.page) + 1 : undefined,
    enabled: dayKey !== null,
    staleTime: ASSIGNMENTS_STALE_TIME,
  });
}
