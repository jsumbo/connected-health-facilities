import { DashboardSummary, FacilitySummary, PaginatedFacilities, AnalyticsSummary } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API error");
  }
  return res.json();
}

export async function getSummary(
  token: string,
  filters: { facility_type?: string } = {}
): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (filters.facility_type) params.set("facility_type", filters.facility_type);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<DashboardSummary>(`/dashboard/summary${query}`, token);
}

export async function getFacilities(
  token: string,
  filters: {
    county?: string;
    tier?: string;
    blocked?: boolean;
    facility_type?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<PaginatedFacilities> {
  const params = new URLSearchParams();
  if (filters.county) params.set("county", filters.county);
  if (filters.tier) params.set("tier", filters.tier);
  if (filters.blocked !== undefined) params.set("blocked", String(filters.blocked));
  if (filters.facility_type) params.set("facility_type", filters.facility_type);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<PaginatedFacilities>(`/dashboard/facilities${query}`, token);
}

export async function getFacility(
  token: string,
  id: string
): Promise<FacilitySummary> {
  return apiFetch<FacilitySummary>(`/dashboard/facilities/${id}`, token);
}

export async function getAnalytics(
  token: string,
  filters: { facility_type?: string } = {}
): Promise<AnalyticsSummary> {
  const params = new URLSearchParams();
  if (filters.facility_type) params.set("facility_type", filters.facility_type);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<AnalyticsSummary>(`/dashboard/analytics${query}`, token);
}

export async function loginRequest(
  username: string,
  password: string
): Promise<{ access_token: string }> {
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}
