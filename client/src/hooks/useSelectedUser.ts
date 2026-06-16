import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const SELECTED_USER_ID_KEY = 'selected-user-id';

const readStoredUserId = (): string | null => {
  const stored = sessionStorage.getItem(SELECTED_USER_ID_KEY);
  return stored?.trim() ? stored : null;
};

type SelectedUserContextValue = {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string) => void;
};

const SelectedUserContext = createContext<SelectedUserContextValue | null>(null);

export function SelectedUserProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({ selectedUserId, setSelectedUserId }),
    [selectedUserId, setSelectedUserId],
  );

  return createElement(SelectedUserContext.Provider, { value }, children);
}

export function useSelectedUser() {
  const context = useContext(SelectedUserContext);
  if (!context) {
    throw new Error('useSelectedUser must be used within SelectedUserProvider');
  }
  return context;
}
