export async function fetchJSON<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const body = await res.text();
  if (!body) return {} as T;
  return JSON.parse(body) as T;
}
