import type { CooperationLog, CooperationLogCreateDto, CooperationLogUpdateDto } from '../types/company';
import type { CooperationEventType } from '../constants/cooperationEventTypes';
import { parseCooperationLogDisplay } from './cooperationLogDisplay';

// Notatka ze spotkania to zwykły wpis historii współpracy:
// title: "[Spotkanie] <tytuł>", newValue: data spotkania (YYYY-MM-DD),
// description: "Uczestnicy: A, B\n\n<treść notatki>"
export const MEETING_EVENT_TYPE: CooperationEventType = 'Spotkanie';
export const DEFAULT_MEETING_TITLE = 'Notatka ze spotkania';

const PARTICIPANTS_PREFIX = 'Uczestnicy:';
const PARTICIPANTS_SEPARATOR = ', ';

export type MeetingNoteDraft = {
  title: string;
  date: string;
  participants: string[];
  content: string;
};

export type ParsedMeetingDescription = {
  participants: string[];
  content: string;
};

const todayIsoDate = () => new Date().toISOString().split('T')[0] ?? '';

const isDateValue = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

export function createEmptyMeetingNoteDraft(): MeetingNoteDraft {
  return { title: '', date: todayIsoDate(), participants: [], content: '' };
}

export function isMeetingLog(log: CooperationLog): boolean {
  return parseCooperationLogDisplay(log).type === MEETING_EVENT_TYPE;
}

export function formatMeetingDescription(participants: string[], content: string): string | null {
  const names = participants.map((name) => name.trim()).filter(Boolean);
  const body = content.trim();
  const parts = [names.length > 0 ? `${PARTICIPANTS_PREFIX} ${names.join(PARTICIPANTS_SEPARATOR)}` : '', body];
  return parts.filter(Boolean).join('\n\n') || null;
}

export function parseMeetingDescription(description: string | null | undefined): ParsedMeetingDescription {
  const text = description?.trim() ?? '';
  if (!text.startsWith(PARTICIPANTS_PREFIX)) {
    return { participants: [], content: text };
  }

  const [firstLine = '', ...rest] = text.split('\n');
  const participants = firstLine
    .slice(PARTICIPANTS_PREFIX.length)
    .split(PARTICIPANTS_SEPARATOR.trim())
    .map((name) => name.trim())
    .filter(Boolean);

  return { participants, content: rest.join('\n').trim() };
}

export function meetingLogToDraft(log: CooperationLog): MeetingNoteDraft {
  const { title } = parseCooperationLogDisplay(log);
  const { participants, content } = parseMeetingDescription(log.description);
  const meetingDate = log.newValue?.trim();

  return {
    title: title === MEETING_EVENT_TYPE ? '' : title,
    date: meetingDate && isDateValue(meetingDate) ? meetingDate : (log.createdAt.split('T')[0] ?? ''),
    participants,
    content,
  };
}

function draftToLogFields(draft: MeetingNoteDraft) {
  return {
    title: `[${MEETING_EVENT_TYPE}] ${draft.title.trim() || DEFAULT_MEETING_TITLE}`,
    description: formatMeetingDescription(draft.participants, draft.content),
    newValue: draft.date || null,
    oldValue: null,
  };
}

export function meetingNoteDraftToCreateDto(draft: MeetingNoteDraft): CooperationLogCreateDto {
  return draftToLogFields(draft);
}

export function meetingNoteDraftToUpdateDto(draft: MeetingNoteDraft): CooperationLogUpdateDto {
  return draftToLogFields(draft);
}
