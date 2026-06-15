import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

type CompanyRowActionMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  ariaLabel?: string;
};

const CompanyRowActionMenu: React.FC<CompanyRowActionMenuProps> = ({
  onEdit,
  onDelete,
  ariaLabel = 'Opcje',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 ${
          isOpen ? 'border border-gray-300 bg-white text-gray-600' : ''
        }`}
      >
        <MoreVertical className="h-5 w-5 stroke-[1.5]" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4 stroke-[1.5]" />
            Edytuj
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 stroke-[1.5]" />
            Usuń
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyRowActionMenu;
