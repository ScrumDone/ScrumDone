import { useMemo } from 'react';
import type { UserSummary } from '../../types/user';
import { useAuthUserName } from '../../lib/authSession';

export function getInitialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2) || '??';
}

export function useCurrentUser() {
    const userName = useAuthUserName();

    const currentUser = useMemo<UserSummary | null>(
        () => (userName ? { id: '', name: userName } : null),
        [userName],
    );

    return {
        currentUser,
        // Bez endpointu /me nie znamy id — nie podstawiamy users[0].
        currentUserId: null as string | null,
        isLoading: false,
        isError: false,
    };
}
