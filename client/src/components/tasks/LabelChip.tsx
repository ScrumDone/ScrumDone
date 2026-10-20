import { XMarkIcon } from '@heroicons/react/24/outline';
import { labelChipStyle } from '../../utils/labelDisplay';

type LabelChipProps = {
  name: string;
  hexColor: string;
  onRemove?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
};

export const LabelChip = ({
  name,
  hexColor,
  onRemove,
  disabled = false,
  size = 'md',
}: LabelChipProps) => {
  const style = labelChipStyle(hexColor);
  const sizeClassName = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-md border font-medium ${sizeClassName}`}
      style={style}
    >
      <span className="truncate">{name}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Usuń etykietę ${name}`}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="rounded-sm p-0.5 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
};
