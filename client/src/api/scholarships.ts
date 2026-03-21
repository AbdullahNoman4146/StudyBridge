import { API, handleResponse } from "./auth";

export interface CountryOption {
    id: number;
    name: string;
}

export interface Scholarship {
    id: number;
    title: string;
    university_name: string;
    degree_level: string;
    funding_type: string;
    amount: string | null;
    deadline: string;
    intake: string | null;
    description: string;
    eligibility: string | null;
    application_instructions: string | null;
    required_documents: string[] | null;
    status: "active" | "inactive";
    applications_count?: number;
    country?: CountryOption;
    agent?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface ApplicationDocumentItem {
    id: number;
    application_id: number;
    original_name: string;
    mime_type: string | null;
    file_size: number | null;
    created_at: string;
}

export interface ApplicationMessageItem {
    id: number;
    application_id: number;
    sender_id: number;
    message: string;
    created_at: string;
    sender?: {
        id: number;
        name: string;
        email: string;
        role: "admin" | "agent" | "student";
    };
}

export interface ScholarshipApplication {
    id: number;
    scholarship_id: number;
    student_id: number;
    agent_id: number;
    message: string | null;
    status: "submitted" | "under_review" | "needs_documents" | "approved" | "rejected";
    agent_note: string | null;
    submitted_at: string;
    scholarship?: Scholarship;
    student?: {
        id: number;
        name: string;
        email: string;
        student_profile?: {
            phone: string | null;
            address: string | null;
        };
    };
    documents: ApplicationDocumentItem[];
    messages: ApplicationMessageItem[];
}

export interface ScholarshipPayload {
    title: string;
    university_name: string;
    degree_level: string;
    funding_type: string;
    amount: string;
    deadline: string;
    intake: string;
    description: string;
    eligibility: string;
    application_instructions: string;
    required_documents: string[];
    status: "active" | "inactive";
}

function getAuthHeaders(extra: HeadersInit = {}) {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        ...extra
    };
}

export async function getAgentScholarships(): Promise<Scholarship[]> {
    const res = await fetch(`${API}/agent/scholarships`, {
        headers: getAuthHeaders()
    });

    return handleResponse(res) as Promise<Scholarship[]>;
}

export async function createScholarship(payload: ScholarshipPayload) {
    const res = await fetch(`${API}/agent/scholarships`, {
        method: "POST",
        headers: getAuthHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(payload)
    });

    return handleResponse(res) as Promise<{ message: string; scholarship: Scholarship }>;
}

export async function updateScholarship(id: number, payload: ScholarshipPayload) {
    const res = await fetch(`${API}/agent/scholarships/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(payload)
    });

    return handleResponse(res) as Promise<{ message: string; scholarship: Scholarship }>;
}

export async function getStudentScholarships(countryId?: string, search?: string): Promise<Scholarship[]> {
    const params = new URLSearchParams();

    if (countryId) {
        params.set("country_id", countryId);
    }

    if (search && search.trim()) {
        params.set("search", search.trim());
    }

    const query = params.toString();
    const res = await fetch(`${API}/student/scholarships${query ? `?${query}` : ""}`, {
        headers: getAuthHeaders()
    });

    return handleResponse(res) as Promise<Scholarship[]>;
}

export async function applyToScholarship(scholarshipId: number, message: string, files: File[]) {
    const formData = new FormData();
    formData.append("message", message);
    files.forEach((file) => formData.append("documents[]", file));

    const res = await fetch(`${API}/student/scholarships/${scholarshipId}/apply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
    });

    return handleResponse(res) as Promise<{ message: string; application: ScholarshipApplication }>;
}

export async function getStudentApplications(): Promise<ScholarshipApplication[]> {
    const res = await fetch(`${API}/student/applications`, {
        headers: getAuthHeaders()
    });

    return handleResponse(res) as Promise<ScholarshipApplication[]>;
}

export async function submitRequestedDocuments(applicationId: number, message: string, files: File[]) {
    const formData = new FormData();

    if (message.trim()) {
        formData.append("message", message.trim());
    }

    files.forEach((file) => formData.append("documents[]", file));

    const res = await fetch(`${API}/student/applications/${applicationId}/documents`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
    });

    return handleResponse(res) as Promise<{ message: string; application: ScholarshipApplication }>;
}

export async function getAgentApplications(): Promise<ScholarshipApplication[]> {
    const res = await fetch(`${API}/agent/applications`, {
        headers: getAuthHeaders()
    });

    return handleResponse(res) as Promise<ScholarshipApplication[]>;
}

export async function updateAgentApplicationStatus(
    applicationId: number,
    status: ScholarshipApplication["status"],
    agent_note: string
) {
    const res = await fetch(`${API}/agent/applications/${applicationId}`, {
        method: "PUT",
        headers: getAuthHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({ status, agent_note })
    });

    return handleResponse(res) as Promise<{ message: string; application: ScholarshipApplication }>;
}

export async function sendApplicationMessage(applicationId: number, message: string) {
    const res = await fetch(`${API}/applications/${applicationId}/messages`, {
        method: "POST",
        headers: getAuthHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({ message })
    });

    return handleResponse(res) as Promise<{ message: string; application: ScholarshipApplication }>;
}

export async function downloadApplicationDocument(documentId: number, filename: string) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/documents/${documentId}/download`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const text = await res.text();
        try {
            const data = JSON.parse(text) as { message?: string };
            throw new Error(data.message || "Failed to download document");
        } catch {
            throw new Error("Failed to download document");
        }
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
}