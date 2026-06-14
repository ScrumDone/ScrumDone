/**
 * Assignment items nested in sprint responses are typed in types/assignment.ts (T0-B1).
 * Until then, assignments are intentionally untyped here.
 */
export type SprintApiState = 'Active' | 'Planned' | 'Finished' | 'Being planned';

export type SprintSummary = {
  id: string;
  name: string | null;
  state: SprintApiState | string | null;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  isKanban: boolean;
  assignmentCount: number;
  completedCount: number;
  assignments?: unknown[] | null;
};

export type SprintDetail = {
  id: string;
  name: string | null;
  state: SprintApiState | string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  isKanban: boolean;
  assignmentCount: number;
  completedCount: number;
  assignments: unknown[];
};

export type SprintCreateDto = {
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isKanban?: boolean;
};

export type SprintUpdateDto = {
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type SprintQueryParams = {
  page?: number;
  limit?: number;
};
