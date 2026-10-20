import { ApiError } from '../api/client';
import type {
  ProjectAssignmentLabel,
  ProjectLabelCreateDto,
  ProjectLabelUpdateDto,
} from '../types/project';
import { hexToRgba } from './color';

export type ProjectLabelChipViewModel = {
  id: string;
  name: string;
  hexColor: string;
};

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const isValidHexColor = (value: string): boolean => HEX_COLOR_PATTERN.test(value.trim());

export const normalizeHexColor = (value: string): string => {
  const trimmed = value.trim();

  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return trimmed.toUpperCase();
};

export const mapProjectAssignmentLabelToChip = (
  label: ProjectAssignmentLabel,
): ProjectLabelChipViewModel => ({
  id: label.id,
  name: label.name.trim(),
  hexColor: normalizeHexColor(label.hexColor),
});

export const toProjectLabelCreateDto = (
  name: string,
  hexColor: string,
): ProjectLabelCreateDto | null => {
  const trimmedName = name.trim();
  const normalizedColor = normalizeHexColor(hexColor);

  if (!trimmedName || !isValidHexColor(normalizedColor)) {
    return null;
  }

  return {
    name: trimmedName,
    hexColor: normalizedColor,
  };
};

export const toProjectLabelUpdateDto = (input: {
  name?: string;
  hexColor?: string;
}): ProjectLabelUpdateDto | null => {
  const dto: ProjectLabelUpdateDto = {};

  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return null;
    }
    dto.name = trimmedName;
  }

  if (input.hexColor !== undefined) {
    const normalizedColor = normalizeHexColor(input.hexColor);
    if (!isValidHexColor(normalizedColor)) {
      return null;
    }
    dto.hexColor = normalizedColor;
  }

  if (dto.name === undefined && dto.hexColor === undefined) {
    return null;
  }

  return dto;
};

export const PROJECT_LABEL_LIMIT = 50;
export const ASSIGNMENT_LABEL_LIMIT = 20;

export const LABEL_NAME_REQUIRED_MESSAGE = 'Podaj nazwę etykiety.';
export const LABEL_NAME_TOO_LONG_MESSAGE = 'Nazwa może mieć najwyżej 200 znaków.';
export const LABEL_NAME_TAKEN_MESSAGE = 'Etykieta o tej nazwie już istnieje.';
export const PROJECT_LABEL_LIMIT_MESSAGE = 'Projekt może mieć najwyżej 50 etykiet.';
export const ASSIGNMENT_LABEL_LIMIT_MESSAGE = 'Zadanie może mieć najwyżej 20 etykiet.';

/** Ta sama paleta co ColorHelper.HighlyDistinctColors, gdy GET /utils/default-colors się nie uda. */
export const FALLBACK_LABEL_COLORS = [
  '#0072B2',
  '#D55E00',
  '#009E73',
  '#CC79A7',
  '#E69F00',
  '#56B4E9',
  '#000000',
  '#F0E442',
  '#882255',
  '#44AA99',
  '#AA4499',
  '#117733',
];

const hexChannel = (hex: string, start: number) => Number.parseInt(hex.slice(start, start + 2), 16);

const isLightHex = (hex: string) => {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return false;
  }

  const luminance = (0.299 * hexChannel(raw, 0) + 0.587 * hexChannel(raw, 2) + 0.114 * hexChannel(raw, 4)) / 255;
  return luminance > 0.75;
};

const darkenHex = (hex: string) => {
  const raw = hex.replace('#', '');
  const mix = (start: number) =>
    Math.round(hexChannel(raw, start) * 0.62)
      .toString(16)
      .padStart(2, '0');

  return `#${mix(0)}${mix(2)}${mix(4)}`.toUpperCase();
};

export const labelChipStyle = (hexColor: string) => {
  const normalized = normalizeHexColor(hexColor);
  const valid = isValidHexColor(normalized);

  return {
    color: valid ? (isLightHex(normalized) ? darkenHex(normalized) : normalized) : '#475569',
    backgroundColor: valid ? (hexToRgba(normalized, 0.14) ?? '#F1F5F9') : '#F1F5F9',
    borderColor: valid ? (hexToRgba(normalized, 0.4) ?? '#E2E8F0') : '#E2E8F0',
  };
};

export const hasProjectLabelName = (
  labels: { id: string; name: string }[],
  name: string,
  ignoreId?: string,
) => {
  const trimmed = name.trim();
  return labels.some((label) => label.id !== ignoreId && label.name.trim() === trimmed);
};

export const describeProjectLabelWriteError = (error: unknown) => {
  if (error instanceof ApiError && error.status === 409) {
    if (/already a label with this name/i.test(error.message)) {
      return LABEL_NAME_TAKEN_MESSAGE;
    }

    if (/maximum number of labels/i.test(error.message)) {
      return PROJECT_LABEL_LIMIT_MESSAGE;
    }
  }

  return 'Nie udało się zapisać etykiety.';
};

export const describeAssignmentLabelsError = (error: unknown, labelCount: number) => {
  if (
    labelCount > ASSIGNMENT_LABEL_LIMIT
    || (error instanceof ApiError && error.status === 400 && labelCount >= ASSIGNMENT_LABEL_LIMIT)
  ) {
    return ASSIGNMENT_LABEL_LIMIT_MESSAGE;
  }

  return 'Nie udało się zaktualizować etykiet zadania.';
};
