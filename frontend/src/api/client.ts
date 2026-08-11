import type {
  Item,
  ItemInput,
  ItemListResponse,
  Photo,
  ScaffaleGroup,
  ScaffaleSummary,
  SearchFilters,
  Sezione,
} from "./types";

const TOKEN_KEY = "mg_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function formatErrorDetail(detail: unknown): string | null {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => {
        const field = Array.isArray(e?.loc) ? e.loc.slice(1).join(".") : "";
        return field ? `${field}: ${e.msg}` : e.msg;
      })
      .join(" — ");
  }
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api${path}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new Event("mg-unauthorized"));
    throw new Error("Autenticazione richiesta");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(formatErrorDetail(body?.detail) || `Errore ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getAuthStatus() {
  return request<{ auth_required: boolean }>("/auth/status");
}

export function login(password: string) {
  return request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

function buildQuery(params: SearchFilters): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function listItems(filters: SearchFilters) {
  return request<ItemListResponse>(`/items${buildQuery(filters)}`);
}

export function getItem(id: number) {
  return request<Item>(`/items/${id}`);
}

export function createItem(input: ItemInput) {
  return request<Item>("/items", { method: "POST", body: JSON.stringify(input) });
}

export function updateItem(id: number, input: Partial<ItemInput>) {
  return request<Item>(`/items/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteItem(id: number) {
  return request<void>(`/items/${id}`, { method: "DELETE" });
}

export async function uploadPhoto(itemId: number, file: File): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);
  return request<Photo>(`/items/${itemId}/photos`, { method: "POST", body: formData });
}

export function deletePhoto(photoId: number) {
  return request<void>(`/photos/${photoId}`, { method: "DELETE" });
}

export function getScaffali() {
  return request<ScaffaleSummary[]>("/scaffali");
}

export function getScaffale(scaffale: string) {
  return request<ScaffaleGroup>(`/scaffali/${encodeURIComponent(scaffale)}`);
}

export function getScatola(scaffale: string, scatola: string) {
  return request<Item[]>(
    `/scatole/${encodeURIComponent(scaffale)}/${encodeURIComponent(scatola)}`
  );
}

export function getCategorie(sezione?: Sezione) {
  return request<string[]>(`/meta/categorie${sezione ? `?sezione=${sezione}` : ""}`);
}

export function getScaffaliMeta() {
  return request<string[]>("/meta/scaffali");
}

export function buildExportUrl(filters: SearchFilters): string {
  return `/api/export/excel${buildQuery(filters)}`;
}

export async function downloadExport(filters: SearchFilters): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(buildExportUrl(filters), { headers });
  if (!response.ok) throw new Error("Esportazione fallita");

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : "mauri_garage_export.xlsx";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function photoUrl(filename: string): string {
  return `/photos/${filename}`;
}
