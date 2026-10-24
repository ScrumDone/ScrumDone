import { useSyncExternalStore } from 'react';

const AUTH_USER_KEY = 'scrumdone.auth.user';
const AUTH_CHANGE_EVENT = 'scrumdone-auth-change';

export type AuthSessionUser = {
    userName: string;
};

export function getAuthSession(): AuthSessionUser | null {
    try {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as AuthSessionUser;
        const userName = parsed?.userName?.trim();
        if (!userName) return null;

        return { userName };
    } catch {
        return null;
    }
}

export function setAuthSession(user: AuthSessionUser) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ userName: user.userName.trim() }));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
    localStorage.removeItem(AUTH_USER_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void) {
    window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);
    window.addEventListener('storage', onStoreChange);

    return () => {
        window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
        window.removeEventListener('storage', onStoreChange);
    };
}

export function useAuthSession() {
    return useSyncExternalStore(subscribe, getAuthSession, () => null);
}
