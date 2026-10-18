import { getAssignments, updateAssignment } from '../api/assignments';
import { createSprint, updateSprint } from '../api/sprints';
import type { SprintSummary } from '../types/sprint';

export type UnfinishedTaskDestination = 'next-sprint' | 'backlog';

export type SprintTaskRef = {
  id: string;
  name: string;
};

export type CloseSprintStepState = 'pending' | 'active' | 'done' | 'error';

export type CloseSprintProgress = {
  close: CloseSprintStepState;
  create: CloseSprintStepState;
  move: CloseSprintStepState;
  moved: number;
  attempted: number;
  totalToMove: number;
  message: string;
};

export type CloseSprintResume = {
  sprintClosed: boolean;
  closedAtIso: string;
  nextEndIso: string;
  newSprintId: string | null;
  newSprintName: string | null;
};

export type CloseSprintSuccess = {
  kind: 'success';
  newSprintId: string;
  newSprintName: string;
  movedCount: number;
  destination: UnfinishedTaskDestination;
};

export type CloseSprintPartial = {
  kind: 'partial';
  stage: 'close' | 'create' | 'move';
  message: string;
  sprintClosed: boolean;
  closedAtIso: string;
  nextEndIso: string;
  newSprintId: string | null;
  newSprintName: string | null;
  movedCount: number;
  failedTasks: Array<SprintTaskRef & { message: string }>;
  destination: UnfinishedTaskDestination;
};

export type CloseSprintOutcome = CloseSprintSuccess | CloseSprintPartial;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_SPRINT_LENGTH_MS = 14 * MS_PER_DAY;

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Nieznany błąd';
}

export function buildNextSprintSchedule(
  startDate: string | null,
  endDate: string | null,
  now = new Date(),
): { nowIso: string; endIso: string; lengthMs: number } {
  let lengthMs = DEFAULT_SPRINT_LENGTH_MS;

  if (startDate && endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      lengthMs = end - start;
    }
  }

  return {
    nowIso: now.toISOString(),
    endIso: new Date(now.getTime() + lengthMs).toISOString(),
    lengthMs,
  };
}

export function closeSprintProgressPercent(progress: CloseSprintProgress): number {
  const totalUnits = 2 + progress.totalToMove;
  let completedUnits = progress.attempted;

  if (progress.close === 'done') {
    completedUnits += 1;
  }

  if (progress.create === 'done') {
    completedUnits += 1;
  }

  if (totalUnits <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completedUnits / totalUnits) * 100));
}

export async function fetchUnfinishedSprintTasks(sprintId: string): Promise<SprintTaskRef[]> {
  const tasks: SprintTaskRef[] = [];
  let page = 1;

  while (page <= 100) {
    const result = await getAssignments({
      SprintIds: [sprintId],
      Page: page,
      Limit: 100,
    });

    for (const assignment of result.items) {
      if (assignment.status?.name === 'Done') {
        continue;
      }

      tasks.push({
        id: assignment.id,
        name: assignment.name,
      });
    }

    if (!result.hasNextPage) {
      break;
    }

    page += 1;
  }

  return tasks;
}

type RunCloseAndStartSprintInput = {
  projectId: string;
  sprintId: string;
  nextSprintName: string;
  previousStartDate: string | null;
  previousEndDate: string | null;
  destination: UnfinishedTaskDestination;
  tasks: SprintTaskRef[];
  resume?: CloseSprintResume;
  onProgress: (progress: CloseSprintProgress) => void;
};

export async function runCloseAndStartSprint(
  input: RunCloseAndStartSprintInput,
): Promise<CloseSprintOutcome> {
  const schedule = input.resume
    ? { nowIso: input.resume.closedAtIso, endIso: input.resume.nextEndIso }
    : buildNextSprintSchedule(input.previousStartDate, input.previousEndDate);

  let nowIso = schedule.nowIso;
  let nextEndIso = schedule.endIso;
  let sprintClosed = input.resume?.sprintClosed ?? false;
  let newSprintId = input.resume?.newSprintId ?? null;
  let newSprintName = input.resume?.newSprintName ?? input.nextSprintName;
  const totalToMove = input.tasks.length;

  const report = (
    progress: Omit<CloseSprintProgress, 'totalToMove' | 'attempted'> & { attempted?: number },
  ) => {
    input.onProgress({
      attempted: 0,
      totalToMove,
      ...progress,
    });
  };

  if (!sprintClosed) {
    report({
      close: 'active',
      create: 'pending',
      move: 'pending',
      moved: 0,
      message: 'Zamykanie sprintu…',
    });

    try {
      const closed = await updateSprint(input.sprintId, { endDate: nowIso });
      sprintClosed = true;
      if (closed.endDate) {
        const lengthMs = new Date(nextEndIso).getTime() - new Date(nowIso).getTime();
        const closedEndMs = new Date(closed.endDate).getTime();

        if (Number.isFinite(lengthMs) && lengthMs > 0 && Number.isFinite(closedEndMs)) {
          nowIso = closed.endDate;
          nextEndIso = new Date(closedEndMs + lengthMs).toISOString();
        }
      }
    } catch (error) {
      const message = toErrorMessage(error);
      report({
        close: 'error',
        create: 'pending',
        move: 'pending',
        moved: 0,
        message,
      });

      return {
        kind: 'partial',
        stage: 'close',
        message,
        sprintClosed: false,
        closedAtIso: nowIso,
        nextEndIso,
        newSprintId: null,
        newSprintName: null,
        movedCount: 0,
        failedTasks: [],
        destination: input.destination,
      };
    }
  }

  if (!newSprintId) {
    report({
      close: 'done',
      create: 'active',
      move: 'pending',
      moved: 0,
      message: 'Tworzenie nowego sprintu…',
    });

    try {
      const created: SprintSummary = await createSprint(input.projectId, {
        name: input.nextSprintName,
        startDate: nowIso,
        endDate: nextEndIso,
        isKanban: false,
      });
      newSprintId = created.id;
      newSprintName = created.name?.trim() || input.nextSprintName;
    } catch (error) {
      const message = toErrorMessage(error);
      report({
        close: 'done',
        create: 'error',
        move: 'pending',
        moved: 0,
        message,
      });

      return {
        kind: 'partial',
        stage: 'create',
        message,
        sprintClosed: true,
        closedAtIso: nowIso,
        nextEndIso,
        newSprintId: null,
        newSprintName: null,
        movedCount: 0,
        failedTasks: [],
        destination: input.destination,
      };
    }
  }

  if (!newSprintId) {
    const message = 'Nie udało się utworzyć nowego sprintu.';
    report({
      close: 'done',
      create: 'error',
      move: 'pending',
      moved: 0,
      message,
    });

    return {
      kind: 'partial',
      stage: 'create',
      message,
      sprintClosed: true,
      closedAtIso: nowIso,
      nextEndIso,
      newSprintId: null,
      newSprintName: null,
      movedCount: 0,
      failedTasks: [],
      destination: input.destination,
    };
  }

  const createdSprintId = newSprintId;
  const targetSprintId = input.destination === 'backlog' ? null : createdSprintId;

  if (totalToMove === 0) {
    report({
      close: 'done',
      create: 'done',
      move: 'done',
      moved: 0,
      message: 'Gotowe',
    });

    return {
      kind: 'success',
      newSprintId: createdSprintId,
      newSprintName,
      movedCount: 0,
      destination: input.destination,
    };
  }

  const failedTasks: CloseSprintPartial['failedTasks'] = [];
  let moved = 0;

  report({
    close: 'done',
    create: 'done',
    move: 'active',
    moved: 0,
    message: `Przenoszenie zadań: 0 z ${totalToMove}`,
  });

  for (const task of input.tasks) {
    try {
      await updateAssignment(task.id, { sprintId: targetSprintId });
      moved += 1;
    } catch (error) {
      failedTasks.push({
        ...task,
        message: toErrorMessage(error),
      });
    }

    const processed = moved + failedTasks.length;
    report({
      close: 'done',
      create: 'done',
      move: failedTasks.length > 0 && processed === totalToMove ? 'error' : 'active',
      moved,
      attempted: processed,
      message: `Przenoszenie zadań: ${processed} z ${totalToMove}`,
    });
  }

  if (failedTasks.length > 0) {
    report({
      close: 'done',
      create: 'done',
      move: 'error',
      moved,
      attempted: totalToMove,
      message: `Przeniesiono ${moved} z ${totalToMove}`,
    });

    return {
      kind: 'partial',
      stage: 'move',
      message: failedTasks[0]?.message ?? 'Nie udało się przenieść części zadań.',
      sprintClosed: true,
      closedAtIso: nowIso,
      nextEndIso,
      newSprintId: createdSprintId,
      newSprintName,
      movedCount: moved,
      failedTasks,
      destination: input.destination,
    };
  }

  report({
    close: 'done',
    create: 'done',
    move: 'done',
    moved,
    attempted: totalToMove,
    message: 'Gotowe',
  });

  return {
    kind: 'success',
    newSprintId: createdSprintId,
    newSprintName,
    movedCount: moved,
    destination: input.destination,
  };
}
