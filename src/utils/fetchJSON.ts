export async function fetchJSON<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const body = await res.text();
  if (!res.ok) {
    let error = body ? tryParseError(body) : res.statusText;
    throw new Error(typeof error === 'string' && error ? error : `Request failed (${res.status})`);
  }
  if (!body) return {} as T;
  return JSON.parse(body) as T;
}

function tryParseError(body: string): string {
  try { return JSON.parse(body).error || ''; } catch { return ''; }
}
