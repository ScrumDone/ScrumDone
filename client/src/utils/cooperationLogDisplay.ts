import type { CooperationLog, CooperationLogUpdateDto } from '../types/company';
import {
  COOPERATION_EVENT_TYPES,
  type CooperationEventType,
} from '../constants/cooperationEventTypes';

const EVENT_TYPE_PREFIX_PATTERN = /^\[(.+?)\]\s*(.*)$/s;

export type CooperationLogDisplay = {
  type: string;
  title: string;
};

export type CompanyLogEditDraft = {
  title: string;
  eventType: string;
  date: string;
  description: string;
};

const isDateValue = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

const isChangeLog = (log: CooperationLog) => {
  const changeFrom = log.oldValue?.trim();
  const changeTo = log.newValue?.trim();
  return Boolean(changeFrom && changeTo && !isDateValue(changeTo));
};

export function parseCooperationLogDisplay(log: CooperationLog): CooperationLogDisplay {
  const trimmedTitle = log.title.trim();
  const match = trimmedTitle.match(EVENT_TYPE_PREFIX_PATTERN);

  if (match?.[1]) {
    const type = match[1].trim();
    const title = (match[2] ?? '').trim() || type;
    return { type, title };
  }

  const changeFrom = log.oldValue?.trim();
  const changeTo = log.newValue?.trim();
  if (changeFrom && changeTo) {
    return { type: 'Zmiana', title: trimmedTitle };
  }

  return { type: 'Wydarzenie', title: trimmedTitle };
}

export function cooperationLogToEditDraft(log: CooperationLog): CompanyLogEditDraft {
  const { type, title } = parseCooperationLogDisplay(log);
  const eventType = COOPERATION_EVENT_TYPES.includes(type as CooperationEventType) ? type : 'Inne';

  let date = log.createdAt.split('T')[0] ?? '';
  if (log.newValue?.trim() && isDateValue(log.newValue) && !isChangeLog(log)) {
    date = log.newValue.trim();
  }

  return {
    title,
    eventType,
    date,
    description: log.description ?? '',
  };
}

export function companyLogEditDraftToUpdateDto(
  draft: CompanyLogEditDraft,
  originalLog: CooperationLog,
): CooperationLogUpdateDto {
  if (isChangeLog(originalLog)) {
    return {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      oldValue: originalLog.oldValue,
      newValue: originalLog.newValue,
    };
  }

  return {
    title: `[${draft.eventType}] ${draft.title.trim()}`,
    description: draft.description.trim() || null,
    newValue: draft.date || null,
    oldValue: null,
  };
}
