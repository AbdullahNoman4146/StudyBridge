const API = import.meta.env.VITE_BACKEND_ENDPOINT
  ? import.meta.env.VITE_BACKEND_ENDPOINT + "/api"
  : "/api";

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Server error: ${res.status}`);
  }

  return data;
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
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      password,
      phone,
      address
    })
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError)) {
        throw new Error(firstError[0]);
      }
    }

    throw new Error(data.message || `Server error: ${res.status}`);
  }

  return data;
}


export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Server error: ${res.status}`);
  }

  return data;
}

export async function logout() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Server error: ${res.status}`);
  }

  return data;
}