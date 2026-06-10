import { useCallback, useEffect, useState } from 'react';

export const SELECTED_USER_ID_KEY = 'selected-user-id';

const readStoredUserId = (): string | null => {
  const stored = sessionStorage.getItem(SELECTED_USER_ID_KEY);
  return stored?.trim() ? stored : null;
};

export function useSelectedUser() {
  const [selectedUserId, setSelectedUserIdState] = useState<string | null>(() => readStoredUserId());

  useEffect(() => {
    if (selectedUserId) {
      sessionStorage.setItem(SELECTED_USER_ID_KEY, selectedUserId);
      return;
    }
    sessionStorage.removeItem(SELECTED_USER_ID_KEY);
  }, [selectedUserId]);

  const setSelectedUserId = useCallback((userId: string) => {
    setSelectedUserIdState(userId);
  }, []);

  return { selectedUserId, setSelectedUserId };
};
