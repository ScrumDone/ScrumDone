export type ApiValidationErrors = Record<string, string[]>;

type ApiErrorBody = {
  title?: string;
  errors?: ApiValidationErrors;
  detail?: string;
};

export class ApiError extends Error {
  status: number;
  title?: string;
  errors?: ApiValidationErrors;
  body?: unknown;

  constructor(
    message: string,
    status: number,
    options?: { title?: string; errors?: ApiValidationErrors; body?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;

    if (options?.title) {
      this.title = options.title;
    }

    if (options?.errors) {
      this.errors = options.errors;
    }

    if (options?.body !== undefined) {
      this.body = options.body;
    }
  }
}

function formatValidationMessage(errors: ApiValidationErrors): string {
  const parts = Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => `${field}: ${message}`),
  );

  return parts.join('; ');
}
  
  function getBaseUrl(): string {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
      throw new Error('Brak VITE_API_URL w .env.development');
    }
    return url.replace(/\/$/, ''); // bez slasha na końcu
  }
  
  export type QueryParamValue = string | number | boolean | undefined | null | string[];

  function buildUrl(
    path: string,
    params?: Record<string, QueryParamValue>,
  ): string {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, getBaseUrl());
  
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;

        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }
  
    return url.toString();
  }
  
  async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      let title: string | undefined;
      let errors: ApiValidationErrors | undefined;
      let body: unknown;

      try {
        body = await response.json();

        if (body && typeof body === 'object') {
          const problem = body as ApiErrorBody;
          title = problem.title;
          errors = problem.errors;

          if (errors && Object.keys(errors).length > 0) {
            message = formatValidationMessage(errors);
          } else if (problem.detail?.trim()) {
            message = problem.detail;
          } else if (title) {
            message = title;
          }
        }
      } catch {
        // brak JSON w błędzie — zostaje message z statusu
      }

      throw new ApiError(message, response.status, {
        ...(title ? { title } : {}),
        ...(errors ? { errors } : {}),
        ...(body !== undefined ? { body } : {}),
      });
    }
  
    if (response.status === 204) {
      return undefined as T;
    }
  
    return response.json() as Promise<T>;
  }
  
  export async function apiGet<T>(
    path: string,
    params?: Record<string, QueryParamValue>,
  ): Promise<T> {
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
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

  export async function apiPut<T, B = unknown>(
    path: string,
    body: B,
  ): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return parseResponse<T>(response);
  }
  
  export async function apiDelete(path: string): Promise<void> {
    const response = await fetch(buildUrl(path), { method: 'DELETE' });
    return parseResponse<void>(response);
  }