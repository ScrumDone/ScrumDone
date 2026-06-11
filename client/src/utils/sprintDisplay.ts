import type { SprintEditDraft } from '../components/SprintEditModal';
import type { SprintDetail, SprintSummary, SprintUpdateDto } from '../types/sprint';

export type SprintStatus = SprintEditDraft['status'];

export type SprintCardViewModel = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  status: SprintStatus;
};

export type SprintSelectorStatus = 'Aktywny' | 'Ukończony' | 'Planowany';

export type SprintSelectorViewModel = {
  id: string;
  title: string;
  dateRange: string;
  totalTasks: number;
  completedTasks: number;
  status: SprintSelectorStatus;
};

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatSprintDateForDisplay = (dateValue: string | null): string => {
  if (!dateValue) {
    return '—';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const day = date.getDate();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const toEditDateValue = (date: string | null): string => {
  const formatted = formatSprintDateForDisplay(date);
  return formatted === '—' ? '' : formatted;
};

const parseDisplayDateToIso = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const dottedMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (dottedMatch) {
    const day = Number(dottedMatch[1]);
    const month = Number(dottedMatch[2]);
    const year = Number(dottedMatch[3]);
    const date = new Date(year, month - 1, day);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return trimmed;
};

export const deriveSprintStatus = (
  startDate: string | null,
  endDate: string | null,
  referenceDate: Date = new Date(),
): SprintStatus => {
  const today = startOfDay(referenceDate);
  const start = startDate ? startOfDay(new Date(startDate)) : null;
  const end = endDate ? startOfDay(new Date(endDate)) : null;

  if (end && !Number.isNaN(end.getTime()) && end < today) {
    return 'Ukończony';
  }

  if (start && !Number.isNaN(start.getTime()) && start > today) {
    return 'Zaplanowany';
  }

  if (start && !Number.isNaN(start.getTime()) && start <= today) {
    return 'Aktywny';
  }

  return 'Zaplanowany';
};

export const mapSprintStatusToSelectorStatus = (status: SprintStatus): SprintSelectorStatus =>
  status === 'Zaplanowany' ? 'Planowany' : status;

export const formatSprintDateRangeForDisplay = (
  startDate: string | null,
  endDate: string | null,
): string => {
  const start = formatSprintDateForDisplay(startDate);
  const end = formatSprintDateForDisplay(endDate);

  return `${start} - ${end}`;
};

export const mapSprintSummaryToSelectorSprint = (summary: SprintSummary): SprintSelectorViewModel => {
  const status = deriveSprintStatus(summary.startDate, summary.endDate);

  return {
    id: summary.id,
    title: summary.name?.trim() || '—',
    dateRange: formatSprintDateRangeForDisplay(summary.startDate, summary.endDate),
    totalTasks: summary.assignmentCount,
    completedTasks: summary.completedCount,
    status: mapSprintStatusToSelectorStatus(status),
  };
};

export const mapSprintSummariesToSelectorSprints = (
  summaries: SprintSummary[],
): SprintSelectorViewModel[] => summaries.map(mapSprintSummaryToSelectorSprint);

export const getDefaultSelectedSprintId = (sprints: SprintSelectorViewModel[]): string | null => {
  if (sprints.length === 0) {
    return null;
  }

  const activeSprint = sprints.find((sprint) => sprint.status === 'Aktywny');
  if (activeSprint) {
    return activeSprint.id;
  }

  return sprints[0]?.id ?? null;
};

export const mapSprintSummaryToSprintCard = (summary: SprintSummary): SprintCardViewModel => ({
  id: summary.id,
  title: summary.name?.trim() || '—',
  startDate: formatSprintDateForDisplay(summary.startDate),
  endDate: formatSprintDateForDisplay(summary.endDate),
  totalTasks: summary.assignmentCount,
  completedTasks: summary.completedCount,
  status: deriveSprintStatus(summary.startDate, summary.endDate),
});

export const mapSprintSummaryToEditDraft = (summary: SprintSummary): SprintEditDraft => ({
  title: summary.name?.trim() || '',
  startDate: toEditDateValue(summary.startDate),
  endDate: toEditDateValue(summary.endDate),
  status: deriveSprintStatus(summary.startDate, summary.endDate),
});

export const mapSprintDetailToEditDraft = (sprint: SprintDetail): SprintEditDraft => ({
  title: sprint.name?.trim() || '',
  startDate: toEditDateValue(sprint.startDate),
  endDate: toEditDateValue(sprint.endDate),
  status: deriveSprintStatus(sprint.startDate, sprint.endDate),
});

export const toSprintUpdateDto = (draft: SprintEditDraft): SprintUpdateDto | null => {
  const name = draft.title.trim();
  if (!name) {
    return null;
  }

  return {
    name,
    startDate: parseDisplayDateToIso(draft.startDate),
    endDate: parseDisplayDateToIso(draft.endDate),
  };
};

export const addDaysToDisplayDate = (displayDate: string, days: number): string => {
  const iso = parseDisplayDateToIso(displayDate);
  if (!iso) {
    return displayDate;
  }

  const date = new Date(iso);
  date.setDate(date.getDate() + days);

  return formatSprintDateForDisplay(date.toISOString());
};

export const deriveSprintStatusFromDisplayDates = (startDate: string, endDate: string): SprintStatus =>
  deriveSprintStatus(parseDisplayDateToIso(startDate), parseDisplayDateToIso(endDate));

export const toSprintEndDateUpdateDto = (displayEndDate: string, extraDays = 0): SprintUpdateDto => {
  const targetDate = extraDays > 0 ? addDaysToDisplayDate(displayEndDate, extraDays) : displayEndDate;

  return {
    endDate: parseDisplayDateToIso(targetDate),
  };
};
