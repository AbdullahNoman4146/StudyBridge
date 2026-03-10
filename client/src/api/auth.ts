const API = import.meta.env.VITE_BACKEND_ENDPOINT
    ? import.meta.env.VITE_BACKEND_ENDPOINT + "/api"
    : "/api";

async function handleResponse(res: Response) {
    const text = await res.text();

    let data: any = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        throw new Error(data?.message || `Server error: ${res.status}`);
    }

    return data;
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    return handleResponse(res);
}

export async function register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string
) {
    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, phone, address })
    });

    return handleResponse(res);
}

export async function getCurrentUser() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

export async function logout() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

export async function getCountries() {
    const res = await fetch(`${API}/countries`);
    return handleResponse(res);
}

export async function createAgent(
    name: string,
    email: string,
    password: string,
    country_id: number
) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/admin/agents`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, country_id })
    });

    return handleResponse(res);
}

export async function getAdminSummary() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/admin/summary`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

export async function getStudentsList() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/admin/students`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

export async function getAgentsList() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/admin/agents`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

export async function deleteStudent(id: number) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/admin/students/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

export async function deleteAgent(id: number) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/admin/agents/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

export async function changeAgentPassword(
    current_password: string,
    new_password: string,
    new_password_confirmation: string
) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/agent/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            current_password,
            new_password,
            new_password_confirmation
        })
    });

    return handleResponse(res);
}