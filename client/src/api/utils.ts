import { apiGet } from './client';

/** Paleta kolorów proponowanych dla projektów (GET /api/utils/default-colors). */
export function getDefaultColors() {
  return apiGet<string[]>('/api/utils/default-colors');
}
