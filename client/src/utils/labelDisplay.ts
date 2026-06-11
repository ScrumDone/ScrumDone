import type {
  ProjectAssignmentLabel,
  ProjectLabelCreateDto,
  ProjectLabelUpdateDto,
} from '../types/project';

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
