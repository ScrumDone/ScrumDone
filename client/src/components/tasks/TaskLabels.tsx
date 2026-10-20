import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon, EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Assignment, AssignmentLabel } from '../../types/assignment';
import type { ProjectAssignmentLabel } from '../../types/project';
import { useProjectLabels } from '../../hooks/projects/useProjectLabels';
import { useCreateProjectLabel } from '../../hooks/projects/useCreateProjectLabel';
import { useUpdateProjectLabel } from '../../hooks/projects/useUpdateProjectLabel';
import { useDeleteProjectLabel } from '../../hooks/projects/useDeleteProjectLabel';
import { useUpdateAssignmentLabels } from '../../hooks/assignments/useUpdateAssignmentLabels';
import { useDefaultColors } from '../../hooks/utils/useDefaultColors';
import { LabelChip } from './LabelChip';
import {
  ASSIGNMENT_LABEL_LIMIT,
  ASSIGNMENT_LABEL_LIMIT_MESSAGE,
  FALLBACK_LABEL_COLORS,
  LABEL_NAME_REQUIRED_MESSAGE,
  LABEL_NAME_TAKEN_MESSAGE,
  LABEL_NAME_TOO_LONG_MESSAGE,
  PROJECT_LABEL_LIMIT,
  PROJECT_LABEL_LIMIT_MESSAGE,
  describeAssignmentLabelsError,
  describeProjectLabelWriteError,
  hasProjectLabelName,
  normalizeHexColor,
  toProjectLabelCreateDto,
  toProjectLabelUpdateDto,
} from '../../utils/labelDisplay';

interface TaskLabelsProps {
  assignmentId: string;
  projectId: string;
  labels: AssignmentLabel[];
}

const DEFAULT_LABEL_COLOR = FALLBACK_LABEL_COLORS[0] ?? '#0072B2';

const fieldClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-scrumdone-blue-main';

const withSelectedColor = (colors: string[], selected: string) => {
  if (colors.some((color) => color.toLowerCase() === selected.toLowerCase())) {
    return colors;
  }

  return [selected, ...colors];
};

const LabelColorSwatches = ({
  colors,
  value,
  onChange,
  label,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  label: string;
}) => (
  <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
    {withSelectedColor(colors, value).map((color) => {
      const selected = color.toLowerCase() === value.toLowerCase();

      return (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={`Kolor ${color}`}
          title={color}
          onClick={() => onChange(color)}
          className="h-5 w-5 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: selected ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : undefined,
          }}
        />
      );
    })}
  </div>
);

export const TaskLabels: React.FC<TaskLabelsProps> = ({ assignmentId, projectId, labels }) => {
  const queryClient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');
  const [createColor, setCreateColor] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const { data: projectLabels = [], isLoading: isLabelsLoading, isError: isLabelsError } = useProjectLabels(projectId);
  const { data: defaultColors = [] } = useDefaultColors();
  const palette = defaultColors.length > 0 ? defaultColors : FALLBACK_LABEL_COLORS;
  const selectedCreateColor = createColor ?? palette[0] ?? DEFAULT_LABEL_COLOR;

  const createLabel = useCreateProjectLabel();
  const updateLabel = useUpdateProjectLabel();
  const deleteLabel = useDeleteProjectLabel();
  const updateAssignmentLabels = useUpdateAssignmentLabels();

  const assignedIds = labels.map((label) => label.id);
  const editingLabel = projectLabels.find((label) => label.id === editingId) ?? null;
  const projectLimitReached = projectLabels.length >= PROJECT_LABEL_LIMIT;
  const isAssigning = updateAssignmentLabels.isPending;

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setEditingId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setEditingId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const replaceAssignmentLabels = (labelIds: string[]) => {
    if (labelIds.length > ASSIGNMENT_LABEL_LIMIT) {
      setAssignError(ASSIGNMENT_LABEL_LIMIT_MESSAGE);
      return;
    }

    setAssignError(null);
    updateAssignmentLabels.mutate(
      { assignmentId, labelIds },
      {
        onError: (error) => setAssignError(describeAssignmentLabelsError(error, labelIds.length)),
      },
    );
  };

  const toggleProjectLabel = (labelId: string) => {
    const nextIds = assignedIds.includes(labelId)
      ? assignedIds.filter((id) => id !== labelId)
      : [...assignedIds, labelId];

    replaceAssignmentLabels(nextIds);
  };

  const startEdit = (label: ProjectAssignmentLabel) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(normalizeHexColor(label.hexColor));
    setEditError(null);
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = createName.trim();

    if (!trimmedName) {
      setCreateError(LABEL_NAME_REQUIRED_MESSAGE);
      return;
    }

    if (trimmedName.length > 200) {
      setCreateError(LABEL_NAME_TOO_LONG_MESSAGE);
      return;
    }

    if (projectLimitReached) {
      setCreateError(PROJECT_LABEL_LIMIT_MESSAGE);
      return;
    }

    if (hasProjectLabelName(projectLabels, trimmedName)) {
      setCreateError(LABEL_NAME_TAKEN_MESSAGE);
      return;
    }

    const dto = toProjectLabelCreateDto(trimmedName, selectedCreateColor);
    if (!dto) {
      setCreateError('Wybierz kolor etykiety.');
      return;
    }

    setCreateError(null);
    createLabel.mutate(
      { projectId, data: dto },
      {
        onSuccess: (created) => {
          setCreateName('');
          const current = queryClient.getQueryData<Assignment>(['assignment', assignmentId]);
          const currentIds = current?.labels.map((label) => label.id) ?? assignedIds;
          if (currentIds.includes(created.id)) {
            return;
          }
          if (currentIds.length >= ASSIGNMENT_LABEL_LIMIT) {
            setAssignError(ASSIGNMENT_LABEL_LIMIT_MESSAGE);
            return;
          }

          replaceAssignmentLabels([...currentIds, created.id]);
        },
        onError: (error) => setCreateError(describeProjectLabelWriteError(error)),
      },
    );
  };

  const handleSaveEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editingLabel) {
      return;
    }

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError(LABEL_NAME_REQUIRED_MESSAGE);
      return;
    }

    if (trimmedName.length > 200) {
      setEditError(LABEL_NAME_TOO_LONG_MESSAGE);
      return;
    }

    if (hasProjectLabelName(projectLabels, trimmedName, editingLabel.id)) {
      setEditError(LABEL_NAME_TAKEN_MESSAGE);
      return;
    }

    const nameChanged = trimmedName !== editingLabel.name.trim();
    const colorChanged = normalizeHexColor(editColor) !== normalizeHexColor(editingLabel.hexColor);
    if (!nameChanged && !colorChanged) {
      setEditingId(null);
      return;
    }

    const dto = toProjectLabelUpdateDto({
      ...(nameChanged ? { name: trimmedName } : {}),
      ...(colorChanged ? { hexColor: editColor } : {}),
    });
    if (!dto) {
      setEditError('Wybierz kolor etykiety.');
      return;
    }

    setEditError(null);
    updateLabel.mutate(
      { projectId, labelId: editingLabel.id, data: dto },
      {
        onSuccess: () => setEditingId(null),
        onError: (error) => setEditError(describeProjectLabelWriteError(error)),
      },
    );
  };

  const handleDelete = () => {
    if (!editingLabel) {
      return;
    }

    setEditError(null);
    deleteLabel.mutate(
      { projectId, labelId: editingLabel.id },
      {
        onSuccess: () => setEditingId(null),
        onError: () => setEditError('Nie udało się usunąć etykiety.'),
      },
    );
  };

  return (
    <section ref={menuRef} className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <div className="relative top-[5px]">
            <ChevronDownIcon className="h-5 w-5 stroke-[2.5] text-black" />
          </div>
          <h2 className="text-[20px] leading-[30px] font-medium text-black">Etykiety</h2>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Opcje etykiet"
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
            onClick={() => setIsMenuOpen((open) => !open)}
            className={`cursor-pointer rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-50 hover:text-black ${
              isMenuOpen ? 'border border-slate-200 bg-white text-black' : ''
            }`}
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div
              role="dialog"
              aria-label="Etykiety projektu"
              className="absolute right-0 top-full z-30 mt-2 flex w-80 max-h-[min(28rem,calc(100vh-8rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Etykiety projektu
              </p>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {isLabelsLoading ? (
                  <p className="px-3 py-2 text-sm text-slate-400">Ładowanie etykiet...</p>
                ) : isLabelsError ? (
                  <p className="px-3 py-2 text-sm text-red-600">Nie udało się pobrać etykiet projektu.</p>
                ) : projectLabels.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-400">Brak etykiet w projekcie.</p>
                ) : (
                  <ul className="py-1">
                    {projectLabels.map((label) => {
                      if (editingLabel?.id === label.id) {
                        return (
                          <li key={label.id} className="px-3 py-2">
                            <form onSubmit={handleSaveEdit}>
                              <input
                                value={editName}
                                onChange={(event) => {
                                  setEditName(event.target.value);
                                  setEditError(null);
                                }}
                                aria-label="Nazwa etykiety"
                                className={fieldClassName}
                                maxLength={200}
                                autoFocus
                              />
                              <LabelColorSwatches
                                colors={palette}
                                value={editColor}
                                onChange={setEditColor}
                                label="Kolor edytowanej etykiety"
                              />
                              {editError ? <p className="mt-2 text-xs text-red-600">{editError}</p> : null}
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={handleDelete}
                                  disabled={deleteLabel.isPending}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                  Usuń etykietę
                                </button>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="text-xs text-slate-500 hover:text-slate-800"
                                  >
                                    Anuluj
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={updateLabel.isPending}
                                    className="rounded-md bg-scrumdone-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-[#1a6fe6] disabled:opacity-50"
                                  >
                                    Zapisz
                                  </button>
                                </div>
                              </div>
                            </form>
                          </li>
                        );
                      }

                      const isAssigned = assignedIds.includes(label.id);

                      return (
                        <li key={label.id} className="flex items-center gap-2 px-3 py-1.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: label.hexColor }}
                            aria-hidden="true"
                          />
                          <button
                            type="button"
                            title="Edytuj etykietę"
                            onClick={() => startEdit(label)}
                            className="min-w-0 flex-1 truncate text-left text-sm text-slate-800 hover:underline"
                          >
                            {label.name}
                          </button>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            disabled={isAssigning}
                            onChange={() => toggleProjectLabel(label.id)}
                            aria-label={isAssigned ? `Odepnij ${label.name}` : `Przypisz ${label.name}`}
                            className="h-4 w-4 rounded border-slate-300 accent-scrumdone-blue-600 disabled:cursor-not-allowed"
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {assignError ? <p className="px-3 pb-1 text-xs text-red-600">{assignError}</p> : null}

              <form onSubmit={handleCreate} className="border-t border-slate-200 px-3 py-3">
                <input
                  value={createName}
                  onChange={(event) => {
                    setCreateName(event.target.value);
                    setCreateError(null);
                  }}
                  placeholder="Nazwa etykiety"
                  aria-label="Nazwa etykiety"
                  maxLength={200}
                  disabled={projectLimitReached || createLabel.isPending}
                  className={fieldClassName}
                />
                <LabelColorSwatches
                  colors={palette}
                  value={selectedCreateColor}
                  onChange={setCreateColor}
                  label="Kolor nowej etykiety"
                />
                {createError ? <p className="mt-2 text-xs text-red-600">{createError}</p> : null}
                {projectLimitReached && !createError ? (
                  <p className="mt-2 text-xs text-red-600">{PROJECT_LABEL_LIMIT_MESSAGE}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={projectLimitReached || createLabel.isPending || isLabelsLoading}
                  className="mt-2 w-full rounded-lg bg-scrumdone-blue-200 py-1.5 text-sm font-medium text-scrumdone-blue-600 hover:bg-scrumdone-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Dodaj
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {labels.map((label) => (
            <LabelChip
              key={label.id}
              name={label.name}
              hexColor={label.hexColor}
              disabled={isAssigning}
              onRemove={() => replaceAssignmentLabels(assignedIds.filter((id) => id !== label.id))}
            />
          ))}
        </div>
      ) : (
        <span className="text-[14px] text-slate-400">Brak</span>
      )}

      {assignError && !isMenuOpen ? <p className="mt-2 text-xs text-red-600">{assignError}</p> : null}
    </section>
  );
};
