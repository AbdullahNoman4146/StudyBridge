export interface StoredUser {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
}

const AUTH_CHANGED_EVENT = "auth-changed";

export function getStoredUser(): StoredUser | null {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) return null;

    try {
        return JSON.parse(rawUser) as StoredUser;
    } catch {
        return null;
    }
}

export function getStoredRole(): string | null {
    return localStorage.getItem("role");
}

export function getDashboardPath(role?: string | null): string {
    switch (role) {
        case "admin":
            return "/admin-dashboard";
        case "agent":
            return "/agent-dashboard";
        case "student":
            return "/student-dashboard";
        default:
            return "/login";
    }
}

export function setAuthSession(token: string, user: StoredUser) {
    localStorage.setItem("token", token);
    if (user.role) {
        localStorage.setItem("role", user.role);
    }
    localStorage.setItem("user", JSON.stringify(user));
    emitAuthChanged();
}

export function clearAuthSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    emitAuthChanged();
}

export function emitAuthChanged() {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function subscribeToAuthChanges(callback: () => void) {
    window.addEventListener(AUTH_CHANGED_EVENT, callback);
    window.addEventListener("storage", callback);

    return () => {
        window.removeEventListener(AUTH_CHANGED_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}