import { useMemo } from 'react';
import type { UserSummary } from '../../types/user';
import { useAuthSession } from '../../lib/authSession';

export function getInitialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2) || '??';
}

export function useCurrentUser() {
    const session = useAuthSession();

    const currentUser = useMemo<UserSummary | null>(
        () => (session ? { id: '', name: session.userName } : null),
        [session],
    );

    return {
        currentUser,
        // Bez endpointu /me nie znamy id — nie podstawiamy users[0].
        currentUserId: null as string | null,
        isLoading: false,
        isError: false,
    };
}
