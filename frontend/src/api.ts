const BASE = "/api";

export const getToken = () => localStorage.getItem("pf_token");
export const setToken = (t: string | null) => (t ? localStorage.setItem("pf_token", t) : localStorage.removeItem("pf_token"));

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...init, headers: { ...headers, ...(init.headers as object) } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
