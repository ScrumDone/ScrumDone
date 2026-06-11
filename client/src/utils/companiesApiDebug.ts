import { ApiError } from '../api/client';

type ApiErrorDetails = {
  status?: number;
  message: string;
  title?: string;
  validationErrors?: Record<string, string[]>;
};

const isDev = import.meta.env.DEV;

function formatError(error: unknown): ApiErrorDetails {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      ...(error.title ? { title: error.title } : {}),
      ...(error.errors ? { validationErrors: error.errors } : {}),
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: String(error) };
}

export async function withCompaniesApiLog<T>(
  operation: string,
  request: unknown,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isDev) {
    return fn();
  }

  console.group(`[Companies API] ${operation}`);
  console.log('Request:', request);

  try {
    const response = await fn();
    console.log('Status: OK');
    console.log('Response:', response);
    console.groupEnd();
    return response;
  } catch (error) {
    const details = formatError(error);
    console.error('Status: FAILED', details.status ?? 'unknown');
    console.error('Error:', details.message);

    if (details.title) {
      console.error('Title:', details.title);
    }

    if (details.validationErrors) {
      console.error('Validation errors (co nie przeszło):');
      for (const [field, messages] of Object.entries(details.validationErrors)) {
        for (const message of messages) {
          console.error(`  • ${field}: ${message}`);
        }
      }
    }

    console.groupEnd();
    throw error;
  }
}
