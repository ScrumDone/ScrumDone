import type { CooperationLog } from '../types/company';

const EVENT_TYPE_PREFIX_PATTERN = /^\[(.+?)\]\s*(.*)$/s;

export type CooperationLogDisplay = {
  type: string;
  title: string;
};

export function parseCooperationLogDisplay(log: CooperationLog): CooperationLogDisplay {
  const trimmedTitle = log.title.trim();
  const match = trimmedTitle.match(EVENT_TYPE_PREFIX_PATTERN);

  if (match) {
    const type = match[1].trim();
    const title = match[2].trim() || type;
    return { type, title };
  }

  const changeFrom = log.oldValue?.trim();
  const changeTo = log.newValue?.trim();
  if (changeFrom && changeTo) {
    return { type: 'Zmiana', title: trimmedTitle };
  }

  return { type: 'Wydarzenie', title: trimmedTitle };
}
