// build API base URL
// - if VITE_BACKEND_ENDPOINT is provided (e.g. in production or when proxy
//   is disabled) use it and append `/api`
// - otherwise fall back to a relative path so the Vite dev server proxy takes
//   over.  This prevents "Failed to fetch" when the env var isn't defined.
const API = import.meta.env.VITE_BACKEND_ENDPOINT
    ? import.meta.env.VITE_BACKEND_ENDPOINT + "/api"
    : "/api";

console.debug("API base URL is", API);

export async function login(email: string, password: string) {
    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        // Check if response is ok
        if (!res.ok) {
            const text = await res.text();
            console.error("Login error response:", res.status, text);
            throw new Error(`Server error: ${res.status}`);
        }

        return res.json();
    } catch (error) {
        console.error("Login request failed:", error);
        throw error;
    }
}

export async function register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string
) {
    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password, phone, address })
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Register error response:", res.status, text);
            throw new Error(`Server error: ${res.status}`);
        }

        return res.json();
    } catch (error) {
        console.error("Register request failed:", error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Get user error response:", res.status, text);
            throw new Error(`Server error: ${res.status}`);
        }

        return res.json();
    } catch (error) {
        console.error("Get user request failed:", error);
        throw error;
    }
}

export async function logout() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Logout error response:", res.status, text);
            throw new Error(`Server error: ${res.status}`);
        }

        return res.json();
    } catch (error) {
        console.error("Logout request failed:", error);
        throw error;
    }
}