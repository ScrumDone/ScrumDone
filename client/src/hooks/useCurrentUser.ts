import { useEffect, useMemo } from 'react';
import type { UserSummary } from '../types/user';
import { useSelectedUser } from './useSelectedUser';
import { useUsers } from './useUsers';

export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2) || '??';
}

export function useCurrentUser() {
  const { data, isLoading, isError } = useUsers();
  const { selectedUserId, setSelectedUserId } = useSelectedUser();

  const users = useMemo(() => data?.items ?? [], [data?.items]);

  useEffect(() => {
    if (users.length === 0) return;

    const isValidSelection = selectedUserId && users.some((user) => user.id === selectedUserId);
    const firstUser = users[0];
    if (!isValidSelection && firstUser) {
      setSelectedUserId(firstUser.id);
    }
  }, [users, selectedUserId, setSelectedUserId]);

  const selectedUser = useMemo<UserSummary | null>(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  return {
    users,
    selectedUser,
    selectedUserId,
    setSelectedUserId,
    isLoading,
    isError,
  };
}
