export class ApiError extends Error {
    status: number;
  
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }
  
  function getBaseUrl(): string {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
      throw new Error('Brak VITE_API_URL w .env.development');
    }
    return url.replace(/\/$/, ''); // bez slasha na końcu
  }
  
  function buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, getBaseUrl());
  
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
  
    return url.toString();
  }
  
  async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
  
      try {
        const body = await response.json();
        if (body && typeof body === 'object' && 'title' in body) {
          message = String((body as { title?: string }).title ?? message);
        }
      } catch {
        // brak JSON w błędzie — zostaje message z statusu
      }
  
      throw new ApiError(message, response.status);
    }
  
    if (response.status === 204) {
      return undefined as T;
    }
  
    return response.json() as Promise<T>;
  }
  
  export async function apiGet<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const response = await fetch(buildUrl(path, params));
    return parseResponse<T>(response);
  }
  
  export async function apiPost<T, B = unknown>(
    path: string,
    body: B,
  ): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return parseResponse<T>(response);
  }
  
  export async function apiPatch<T, B = unknown>(
    path: string,
    body: B,
  ): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return parseResponse<T>(response);
  }
  
  export async function apiDelete(path: string): Promise<void> {
    const response = await fetch(buildUrl(path), { method: 'DELETE' });
    return parseResponse<void>(response);
  }