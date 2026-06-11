import React, { useEffect, useRef, useState } from 'react';
import { BellIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import { STRINGS } from '../constants/strings';
import { getInitialsFromName, useCurrentUser } from '../hooks/useCurrentUser';

const TopBar: React.FC = () => {
  const { users, selectedUser, setSelectedUserId, isLoading } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = selectedUser?.name ?? STRINGS.navigation.topBar.user.name;
  const displayInitials = selectedUser ? getInitialsFromName(selectedUser.name) : 'AN';
  const canSwitchUser = users.length > 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setIsOpen(false);
  };

  return (
    <header className="fixed inset-x-0 left-64 top-0 z-30 h-18 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-end gap-4 px-6">
        <button
          type="button"
          className="relative mr-4 rounded-md p-1.5 text-slate-600 transition-colors hover:text-slate-900"
          aria-label={STRINGS.navigation.topBar.notificationsAriaLabel}
        >
          <BellIcon className="h-5.5 w-5.5" strokeWidth={2} />
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-scrumdone-notification-red px-1 text-[0.625rem] font-semibold leading-none text-white">
            4
          </span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => canSwitchUser && setIsOpen((open) => !open)}
            disabled={!canSwitchUser}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors enabled:hover:bg-slate-100 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-scrumdone-blue-main/30 disabled:cursor-default"
            aria-label="Wybierz użytkownika"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <Avatar initials={displayInitials} size="md" />

            <div className="leading-tight">
              <p className="font-segoe-ui text-sm font-medium text-slate-800">
                {isLoading ? 'Ładowanie...' : displayName}
              </p>
              <p className="font-segoe-ui text-xs text-slate-500">{STRINGS.navigation.topBar.user.org}</p>
            </div>

            {canSwitchUser && (
              <ChevronDownIcon
                className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            )}
          </button>

          {isOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
              role="listbox"
            >
              {users.map((user) => {
                const isSelected = user.id === selectedUser?.id;

                return (
                  <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleUserSelect(user.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <Avatar initials={getInitialsFromName(user.name)} size="sm" />
                    <span className="min-w-0 flex-1 truncate font-segoe-ui text-sm text-slate-800">{user.name}</span>
                    {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-scrumdone-blue-main" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
