import { addDays, endOfDay, format, startOfMonth, startOfWeek } from 'date-fns';

export type CalendarView = 'week' | 'month';

// Wszystkie granice liczone w strefie przeglądarki; do API idą jako UTC przez toISOString()
export const getCalendarRange = (view: CalendarView, anchorDate: Date) => {
  const start = view === 'week'
    ? startOfWeek(anchorDate, { weekStartsOn: 1 })
    : startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 });
  const days = Array.from({ length: view === 'week' ? 7 : 42 }, (_, i) => addDays(start, i));
  const end = endOfDay(days[days.length - 1]!);

  return {
    start,
    end,
    days,
    dueFrom: start.toISOString(),
    dueTo: end.toISOString(),
  };
};

// Klucz dnia w strefie lokalnej - ten sam format co CalendarTask.date
export const toDayKey = (date: Date) => format(date, 'yyyy-MM-dd');
