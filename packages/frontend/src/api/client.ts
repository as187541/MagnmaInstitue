// ============================================================
// API Client - Centralized API calls (Supabase only)
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE || "";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

// --- Colleges ---
export async function getColleges(params?: {
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.featured) query.set("featured", "true");
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return fetchApi<any>(`/api/colleges${qs ? `?${qs}` : ""}`);
}

export async function getCollege(id: string) {
  return fetchApi<any>(`/api/colleges/${id}`);
}

// --- Courses ---
export async function getCourses(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchApi<any>(`/api/courses${qs}`);
}

export async function getCourse(id: string) {
  return fetchApi<any>(`/api/courses/${id}`);
}

export async function getCollegesForCourse(courseId: string) {
  return fetchApi<any>(`/api/courses/${courseId}/colleges`);
}

// --- Contact ---
export async function submitContactForm(data: {
  name: string;
  email: string;
  number: string;
  date: string;
  time: string;
  message?: string;
  collegeApplyingFor?: string;
}) {
  return fetchApi<any>("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
