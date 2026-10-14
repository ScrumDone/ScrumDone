import React from 'react';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useDefaultColors } from '../../hooks/utils/useDefaultColors';

type ProjectColorPickerProps = {
  /** Wybrany kolor (#RRGGBB) albo null = kolor dobierze backend. */
  value: string | null;
  onChange: (hexColor: string | null) => void;
  /** Pokazuje opcję „Auto” (brak wyboru) – tylko przy tworzeniu projektu. */
  allowAuto?: boolean;
  disabled?: boolean;
  label?: string;
};

const swatchBaseClassName =
  'flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-scrumdone-blue-main disabled:cursor-not-allowed disabled:opacity-60';

const isSameColor = (a: string | null, b: string | null) =>
  a !== null && b !== null && a.toLowerCase() === b.toLowerCase();

const ProjectColorPicker: React.FC<ProjectColorPickerProps> = ({
  value,
  onChange,
  allowAuto = false,
  disabled = false,
  label = 'Kolor projektu',
}) => {
  const { data: palette = [], isLoading, isError } = useDefaultColors();

  // Kolor spoza palety (np. ustawiony wcześniej) też musi być widoczny jako zaznaczony
  const colors = value && !palette.some((color) => isSameColor(color, value))
    ? [value, ...palette]
    : palette;

  return (
    <div>
      <div className="mb-2 block text-sm font-medium text-slate-700">{label}</div>
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={label}>
        {allowAuto ? (
          <button
            type="button"
            role="radio"
            aria-checked={value === null}
            onClick={() => onChange(null)}
            disabled={disabled}
            title="Automatycznie – kolor dobierze system"
            className={`${swatchBaseClassName} w-auto gap-1 border border-dashed border-slate-300 px-2.5 text-[12px] text-slate-600 ${value === null ? 'ring-2 ring-slate-900' : 'hover:bg-slate-50'}`}
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            Auto
          </button>
        ) : null}

        {colors.map((color) => {
          const isSelected = isSameColor(color, value);

          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Kolor ${color}`}
              title={color}
              onClick={() => onChange(color)}
              disabled={disabled}
              className={`${swatchBaseClassName} ${isSelected ? 'ring-2 ring-slate-900' : 'hover:ring-2 hover:ring-slate-300'}`}
              style={{ backgroundColor: color }}
            >
              {isSelected ? <CheckIcon className="h-4 w-4 text-white drop-shadow" /> : null}
            </button>
          );
        })}

        {isLoading ? <span className="text-[12px] text-slate-400">Ładowanie palety…</span> : null}
        {isError ? <span className="text-[12px] text-red-600">Nie udało się pobrać palety kolorów.</span> : null}
      </div>
    </div>
  );
};

export default ProjectColorPicker;
