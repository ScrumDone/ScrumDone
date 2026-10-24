import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import Avatar from '../common/Avatar';
import { STRINGS } from '../../constants/strings';
import { getInitialsFromName, useCurrentUser } from '../../hooks/users/useCurrentUser';
import { ApiError } from '../../api/client';
import { logout } from '../../api/auth';
import logoutIcon from '../../assets/auth/logout.svg';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = currentUser?.name ?? STRINGS.navigation.topBar.user.name;
  const displayInitials = currentUser ? getInitialsFromName(currentUser.name) : 'AN';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setLogoutError(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setLogoutError(error instanceof ApiError ? error.message : 'Nie udało się wylogować.');
    } finally {
      setIsLoggingOut(false);
    }
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

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setLogoutError(null);
              setIsOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scrumdone-blue-main/30"
            aria-label="Konto"
            aria-haspopup="menu"
            aria-expanded={isOpen}
          >
            <Avatar initials={displayInitials} size="md" />

            <div className="leading-tight">
              <p className="font-segoe-ui text-sm font-medium text-slate-800">
                {isLoading ? 'Ładowanie...' : displayName}
              </p>
              <p className="font-segoe-ui text-xs text-slate-500">{STRINGS.navigation.topBar.user.org}</p>
            </div>
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-[10px] border border-[#e5e7eb] bg-white py-1 shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.1)]">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex h-10 w-full items-center gap-2 px-4 text-left font-segoe-ui text-sm font-medium tracking-[-0.1504px] text-[#e7000b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <img src={logoutIcon} alt="" width={16} height={16} />
                Wyloguj
              </button>
              {logoutError && (
                <p className="px-4 pb-2 font-segoe-ui text-xs leading-4 text-[#e7000b]" role="alert">
                  {logoutError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
