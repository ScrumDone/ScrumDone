import React, { useState, type FormEvent } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { ProjectAssignmentLabel } from '../../types/project';
import { useProjectLabels } from '../../hooks/projects/useProjectLabels';
import { useCreateProjectLabel } from '../../hooks/projects/useCreateProjectLabel';
import { useUpdateProjectLabel } from '../../hooks/projects/useUpdateProjectLabel';
import { useDeleteProjectLabel } from '../../hooks/projects/useDeleteProjectLabel';
import { useDefaultColors } from '../../hooks/utils/useDefaultColors';
import {
  FALLBACK_LABEL_COLORS,
  LABEL_NAME_REQUIRED_MESSAGE,
  LABEL_NAME_TAKEN_MESSAGE,
  LABEL_NAME_TOO_LONG_MESSAGE,
  PROJECT_LABEL_LIMIT,
  PROJECT_LABEL_LIMIT_MESSAGE,
  describeProjectLabelWriteError,
  hasProjectLabelName,
  normalizeHexColor,
  toProjectLabelCreateDto,
  toProjectLabelUpdateDto,
} from '../../utils/labelDisplay';

type ProjectLabelsEditorProps = {
  projectId: string;
  disabled?: boolean;
};

const DEFAULT_LABEL_COLOR = FALLBACK_LABEL_COLORS[0] ?? '#0072B2';

const fieldClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-scrumdone-blue-main disabled:opacity-60';

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
  disabled = false,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  label: string;
  disabled?: boolean;
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
          disabled={disabled}
          onClick={() => onChange(color)}
          className="h-5 w-5 rounded-full disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: color,
            boxShadow: selected ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : undefined,
          }}
        />
      );
    })}
  </div>
);

const ProjectLabelsEditor: React.FC<ProjectLabelsEditorProps> = ({ projectId, disabled = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');
  const [createColor, setCreateColor] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: projectLabels = [], isLoading: isLabelsLoading, isError: isLabelsError } = useProjectLabels(projectId);
  const { data: defaultColors = [] } = useDefaultColors();
  const palette = defaultColors.length > 0 ? defaultColors : FALLBACK_LABEL_COLORS;
  const selectedCreateColor = createColor ?? palette[0] ?? DEFAULT_LABEL_COLOR;

  const createLabel = useCreateProjectLabel();
  const updateLabel = useUpdateProjectLabel();
  const deleteLabel = useDeleteProjectLabel();

  const editingLabel = projectLabels.find((label) => label.id === editingId) ?? null;
  const projectLimitReached = projectLabels.length >= PROJECT_LABEL_LIMIT;
  const isBusy = disabled || createLabel.isPending || updateLabel.isPending || deleteLabel.isPending;

  const startEdit = (label: ProjectAssignmentLabel) => {
    if (disabled) {
      return;
    }

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
        onSuccess: () => {
          setCreateName('');
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
    <div>
      <h3 className="mb-2 block font-segoe-ui text-sm leading-3.5 tracking-[-0.15px] font-medium text-slate-700">
        Etykiety projektu
      </h3>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="max-h-48 overflow-y-auto">
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
                          disabled={isBusy}
                        />
                        <LabelColorSwatches
                          colors={palette}
                          value={editColor}
                          onChange={setEditColor}
                          label="Kolor edytowanej etykiety"
                          disabled={isBusy}
                        />
                        {editError ? <p className="mt-2 text-xs text-red-600">{editError}</p> : null}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Usuń etykietę
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              disabled={isBusy}
                              className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50"
                            >
                              Anuluj
                            </button>
                            <button
                              type="submit"
                              disabled={isBusy}
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
                      disabled={disabled}
                      className="min-w-0 flex-1 truncate text-left font-segoe-ui text-sm text-slate-800 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
                    >
                      {label.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

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
            disabled={disabled || projectLimitReached || createLabel.isPending}
            className={fieldClassName}
          />
          <LabelColorSwatches
            colors={palette}
            value={selectedCreateColor}
            onChange={setCreateColor}
            label="Kolor nowej etykiety"
            disabled={disabled || projectLimitReached || createLabel.isPending}
          />
          {createError ? <p className="mt-2 text-xs text-red-600">{createError}</p> : null}
          {projectLimitReached && !createError ? (
            <p className="mt-2 text-xs text-red-600">{PROJECT_LABEL_LIMIT_MESSAGE}</p>
          ) : null}
          <button
            type="submit"
            disabled={disabled || projectLimitReached || createLabel.isPending || isLabelsLoading}
            className="mt-2 w-full rounded-lg bg-scrumdone-blue-200 py-1.5 text-sm font-medium text-scrumdone-blue-600 hover:bg-scrumdone-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Dodaj
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectLabelsEditor;
