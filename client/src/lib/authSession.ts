import { useSyncExternalStore } from 'react';

const AUTH_USER_KEY = 'scrumdone.auth.user';
const AUTH_CHANGE_EVENT = 'scrumdone-auth-change';

export type AuthSessionUser = {
    userName: string;
};

/** Snapshot to string|null — Object.is jest stabilne, w przeciwieństwie do nowego obiektu przy każdym odczycie. */
export function getAuthUserName(): string | null {
    try {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as AuthSessionUser;
        const userName = parsed?.userName?.trim();
        return userName || null;
    } catch {
        return null;
    }
}

export function getAuthSession(): AuthSessionUser | null {
    const userName = getAuthUserName();
    return userName ? { userName } : null;
}

export function setAuthSession(user: AuthSessionUser) {
    const userName = user.userName.trim();
    if (!userName) {
        clearAuthSession();
        return;
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ userName }));
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

export function useAuthUserName() {
    return useSyncExternalStore(subscribe, getAuthUserName, () => null);
}
