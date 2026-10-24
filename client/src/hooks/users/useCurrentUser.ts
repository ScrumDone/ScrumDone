import { useMemo } from 'react';
import type { UserSummary } from '../../types/user';
import { useUsers } from './useUsers';

export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2) || '??';
}

export function useCurrentUser() {
  const { data, isLoading, isError } = useUsers();

  const currentUser = useMemo<UserSummary | null>(
    () => data?.items[0] ?? null,
    [data?.items],
  );

  return {
    currentUser,
    currentUserId: currentUser?.id ?? null,
    isLoading,
    isError,
  };
}
