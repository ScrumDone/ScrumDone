import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Avatar from '../common/Avatar';
import { getInitialsFromName } from '../../hooks/users/useCurrentUser';
import type { UserSummary } from '../../types/user';

const MAX_VISIBLE_AVATARS = 3;

type TaskAssigneesRowProps = {
  assignees: UserSummary[];
  teamMembers: UserSummary[];
  isEditing: boolean;
  disabled?: boolean;
  onAssigneesChange: (userIds: string[]) => void;
};

export const TaskAssigneesRow: React.FC<TaskAssigneesRowProps> = ({
  assignees,
  teamMembers,
  isEditing,
  disabled = false,
  onAssigneesChange,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const people = useMemo(() => {
    const byId = new Map<string, UserSummary>();
    for (const member of teamMembers) {
      byId.set(member.id, member);
    }
    for (const assignee of assignees) {
      if (!byId.has(assignee.id)) {
        byId.set(assignee.id, assignee);
      }
    }
    return [...byId.values()];
  }, [teamMembers, assignees]);

  const selectedIds = useMemo(() => assignees.map((assignee) => assignee.id), [assignees]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleAssignees = isEditing ? assignees : assignees.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = isEditing ? 0 : Math.max(0, assignees.length - MAX_VISIBLE_AVATARS);
  const overflowNames = assignees.slice(MAX_VISIBLE_AVATARS).map((person) => person.name).join(', ');

  useEffect(() => {
    if (!isEditing) {
      setIsPickerOpen(false);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  const toggleAssignee = (userId: string) => {
    const nextIds = selectedIdSet.has(userId)
      ? selectedIds.filter((id) => id !== userId)
      : [...selectedIds, userId];
    onAssigneesChange(nextIds);
  };

  const removeAssignee = (userId: string) => {
    onAssigneesChange(selectedIds.filter((id) => id !== userId));
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-slate-500">Osoby</span>

      <div className="relative flex min-w-0 items-center justify-end" ref={pickerRef}>
        <div className="flex items-center">
          {assignees.length === 0 ? (
            <span className="mr-1.5 font-medium text-slate-400">Brak</span>
          ) : (
            <div className="flex items-center -space-x-1.5">
              {visibleAssignees.map((person) => (
                <div key={person.id} className="group relative z-0 hover:z-10 focus-within:z-10" title={person.name}>
                  <Avatar
                    initials={getInitialsFromName(person.name)}
                    size="xs"
                    className="ring-2 ring-white"
                    bgClassName="bg-scrumdone-blue-main"
                    textClassName="text-white"
                  />
                  <span className="sr-only">{person.name}</span>
                  {isEditing ? (
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={`Usuń ${person.name}`}
                      title={`Usuń ${person.name}`}
                      onClick={() => removeAssignee(person.id)}
                      className="absolute -right-0.5 -top-0.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-scrumdone-red-500 text-white shadow-sm group-hover:flex group-focus-within:flex disabled:cursor-not-allowed"
                    >
                      <XMarkIcon className="h-2.5 w-2.5 stroke-[3]" />
                    </button>
                  ) : null}
                </div>
              ))}

              {overflowCount > 0 ? (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 font-segoe-ui text-[10px] font-medium text-slate-600 ring-2 ring-white"
                  title={overflowNames}
                  aria-label={`+${overflowCount} więcej przypisanych osób`}
                >
                  +{overflowCount}
                </div>
              ) : null}
            </div>
          )}

          {isEditing ? (
            <button
              type="button"
              disabled={disabled}
              aria-label="Dodaj osoby"
              aria-expanded={isPickerOpen}
              aria-haspopup="listbox"
              onClick={() => setIsPickerOpen((open) => !open)}
              className={`ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isPickerOpen
                  ? 'border-scrumdone-blue-main text-scrumdone-blue-main'
                  : 'border-slate-300 text-slate-400 hover:border-scrumdone-blue-main hover:text-scrumdone-blue-main'
              }`}
            >
              <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          ) : null}
        </div>

        {isEditing && isPickerOpen ? (
          <div
            role="listbox"
            aria-multiselectable="true"
            className="absolute right-0 top-full z-30 mt-2 max-h-64 min-w-[220px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {people.length === 0 ? (
              <p className="px-3 py-2.5 text-[13px] text-slate-500">Brak członków zespołu w projekcie.</p>
            ) : (
              people.map((person) => {
                const isSelected = selectedIdSet.has(person.id);

                return (
                  <button
                    key={person.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={disabled}
                    onClick={() => toggleAssignee(person.id)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected ? 'bg-scrumdone-blue-200' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Avatar
                      initials={getInitialsFromName(person.name)}
                      size="xs"
                      bgClassName={isSelected ? 'bg-scrumdone-blue-main' : 'bg-slate-300'}
                      textClassName="text-white"
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-800">
                      {person.name}
                    </span>
                    {isSelected ? (
                      <CheckIcon className="h-4 w-4 shrink-0 text-scrumdone-blue-main stroke-[2.5]" />
                    ) : (
                      <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
