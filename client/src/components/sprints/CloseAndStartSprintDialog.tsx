import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatCount, PLURALS } from '../../utils/plural';
import { formatSprintDateForDisplay } from '../../utils/sprintDisplay';
import {
  buildNextSprintSchedule,
  closeSprintProgressPercent,
  fetchUnfinishedSprintTasks,
  runCloseAndStartSprint,
  toErrorMessage,
  type CloseSprintPartial,
  type CloseSprintProgress,
  type CloseSprintResume,
  type SprintTaskRef,
  type UnfinishedTaskDestination,
} from '../../utils/closeAndStartSprint';

type CloseAndStartSprintDialogProps = {
  isOpen: boolean;
  projectId: string;
  sprintId: string;
  sprintName: string;
  startDate: string | null;
  endDate: string | null;
  nextSprintName: string;
  onClose: () => void;
  onFinished: () => void;
};

type RunView =
  | { kind: 'form' }
  | { kind: 'running'; progress: CloseSprintProgress }
  | { kind: 'success'; newSprintName: string; movedCount: number; destination: UnfinishedTaskDestination; progress: CloseSprintProgress }
  | { kind: 'partial'; failure: CloseSprintPartial; progress: CloseSprintProgress };

const MS_PER_HOUR = 60 * 60 * 1000;

const formatSprintLength = (lengthMs: number): string => {
  const days = lengthMs / (24 * MS_PER_HOUR);

  if (Math.abs(days - Math.round(days)) < 0.01) {
    return formatCount(Math.round(days), { one: 'dzień', few: 'dni', many: 'dni' });
  }

  const hours = Math.max(1, Math.round(lengthMs / MS_PER_HOUR));
  return formatCount(hours, { one: 'godzina', few: 'godziny', many: 'godzin' });
};

const destinationLabel = (destination: UnfinishedTaskDestination) =>
  destination === 'backlog' ? 'do backlogu' : 'do nowego sprintu';

const StepMarker: React.FC<{ state: CloseSprintProgress['close'] }> = ({ state }) => {
  if (state === 'done') {
    return <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-green-600" aria-hidden />;
  }

  if (state === 'error') {
    return <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-600" aria-hidden />;
  }

  if (state === 'active') {
    return (
      <span
        className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-scrumdone-blue-main"
        aria-hidden
      />
    );
  }

  return <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-slate-300 bg-white" aria-hidden />;
};

const CloseAndStartSprintDialog: React.FC<CloseAndStartSprintDialogProps> = ({
  isOpen,
  projectId,
  sprintId,
  sprintName,
  startDate,
  endDate,
  nextSprintName,
  onClose,
  onFinished,
}) => {
  const queryClient = useQueryClient();
  const runningRef = useRef(false);
  const progressRef = useRef<CloseSprintProgress | null>(null);
  const [destination, setDestination] = useState<UnfinishedTaskDestination>('next-sprint');
  const [tasks, setTasks] = useState<SprintTaskRef[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [runView, setRunView] = useState<RunView>({ kind: 'form' });

  const schedule = buildNextSprintSchedule(startDate, endDate);

  useEffect(() => {
    if (!isOpen || !sprintId) {
      return;
    }

    let cancelled = false;
    const requestKey = `${sprintId}:${reloadKey}`;
    setLoadError(null);

    fetchUnfinishedSprintTasks(sprintId)
      .then((nextTasks) => {
        if (!cancelled) {
          setTasks(nextTasks);
          setLoadedKey(requestKey);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(toErrorMessage(error));
          setTasks([]);
          setLoadedKey(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sprintId, reloadKey]);

  const openIdentity = isOpen ? sprintId : null;
  const [openedSprintId, setOpenedSprintId] = useState<string | null>(null);
  if (openIdentity !== openedSprintId) {
    setOpenedSprintId(openIdentity);
    if (openIdentity) {
      setDestination('next-sprint');
      setFormError(null);
      setRunView({ kind: 'form' });
      setLoadError(null);
      setLoadedKey(null);
      setTasks([]);
    }
  }

  const requestKey = `${sprintId}:${reloadKey}`;
  const isLoadingTasks = isOpen && Boolean(sprintId) && loadedKey !== requestKey && !loadError;

  if (!isOpen) {
    return null;
  }

  const isRunning = runView.kind === 'running';

  const invalidateSprintData = () => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sprints'] });
    queryClient.invalidateQueries({ queryKey: ['sprints'] });
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
  };

  const execute = async (tasksToMove: SprintTaskRef[], resume?: CloseSprintResume) => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;
    setFormError(null);
    const initialProgress: CloseSprintProgress = {
      close: resume?.sprintClosed ? 'done' : 'active',
      create: resume?.newSprintId ? 'done' : 'pending',
      move: 'pending',
      moved: 0,
      attempted: 0,
      totalToMove: tasksToMove.length,
      message: resume?.newSprintId ? 'Przenoszenie zadań…' : resume?.sprintClosed ? 'Tworzenie nowego sprintu…' : 'Zamykanie sprintu…',
    };
    progressRef.current = initialProgress;
    setRunView({
      kind: 'running',
      progress: initialProgress,
    });

    try {
      const outcome = await runCloseAndStartSprint({
        projectId,
        sprintId,
        nextSprintName,
        previousStartDate: startDate,
        previousEndDate: endDate,
        destination,
        tasks: tasksToMove,
        ...(resume ? { resume } : {}),
        onProgress: (progress) => {
          progressRef.current = progress;
          setRunView({ kind: 'running', progress });
        },
      });

      invalidateSprintData();
      const progress = progressRef.current ?? initialProgress;

      if (outcome.kind === 'success') {
        setRunView({
          kind: 'success',
          newSprintName: outcome.newSprintName,
          movedCount: outcome.movedCount,
          destination: outcome.destination,
          progress,
        });
        return;
      }

      setRunView({ kind: 'partial', failure: outcome, progress });
    } catch (error) {
      const progress = progressRef.current ?? initialProgress;
      const stage = progress.close !== 'done' ? 'close' : progress.create !== 'done' ? 'create' : 'move';
      if (progress.close === 'done') {
        invalidateSprintData();
      }
      setRunView({
        kind: 'partial',
        progress,
        failure: {
          kind: 'partial',
          stage,
          message: toErrorMessage(error),
          sprintClosed: progress.close === 'done',
          closedAtIso: resume?.closedAtIso ?? new Date().toISOString(),
          nextEndIso: resume?.nextEndIso ?? new Date().toISOString(),
          newSprintId: resume?.newSprintId ?? null,
          newSprintName: resume?.newSprintName ?? null,
          movedCount: progress.moved,
          failedTasks: [],
          destination,
        },
      });
    } finally {
      runningRef.current = false;
    }
  };

  const handleConfirm = () => {
    const now = Date.now();
    const startMs = startDate ? new Date(startDate).getTime() : Number.NaN;
    const endMs = endDate ? new Date(endDate).getTime() : Number.NaN;

    if (Number.isFinite(endMs) && endMs <= now) {
      setFormError('Ten sprint jest już zakończony.');
      return;
    }

    if (Number.isFinite(startMs) && startMs > now) {
      setFormError('Sprint jeszcze się nie rozpoczął. Zamknąć można sprint aktywny.');
      return;
    }

    void execute(tasks);
  };

  const handleRetry = (failure: CloseSprintPartial) => {
    const tasksToMove = failure.stage === 'move' ? failure.failedTasks : tasks;
    const resume = failure.sprintClosed
      ? {
          sprintClosed: true,
          closedAtIso: failure.closedAtIso,
          nextEndIso: failure.nextEndIso,
          newSprintId: failure.newSprintId,
          newSprintName: failure.newSprintName,
        }
      : undefined;

    void execute(tasksToMove, resume);
  };

  const handleDismiss = () => {
    if (isRunning) {
      return;
    }

    if (runView.kind === 'success' || runView.kind === 'partial') {
      onFinished();
      return;
    }

    onClose();
  };

  const progress = runView.kind === 'form' ? null : runView.progress;
  const percent = progress ? closeSprintProgressPercent(progress) : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/35 px-4" onClick={handleDismiss}>
      <div
        className="flex max-h-[86vh] w-full max-w-[560px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-sprint-title"
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-8">
          <div>
            <h2 id="close-sprint-title" className="mb-2 font-segoe-ui text-[18px] font-semibold tracking-[-0.44px] text-slate-900">
              Zamknij i rozpocznij nowy sprint
            </h2>
            <p className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-slate-500">
              {sprintName} zostanie zamknięty teraz. Nowy sprint „{nextSprintName}” potrwa {formatSprintLength(schedule.lengthMs)} i skończy się {formatSprintDateForDisplay(schedule.endIso)}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isRunning}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
            aria-label="Zamknij okno zamykania sprintu"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {runView.kind === 'form' ? (
            <>
              {loadError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-segoe-ui text-sm text-red-700">
                  <p>Nie udało się wczytać zadań sprintu: {loadError}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((current) => current + 1)}
                    className="mt-2 font-medium underline"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              ) : null}

              {formError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-segoe-ui text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <fieldset disabled={isLoadingTasks || Boolean(loadError)}>
                <legend className="mb-3 font-segoe-ui text-sm font-medium text-slate-800">
                  Niedokończone zadania ({isLoadingTasks ? '…' : tasks.length})
                </legend>

                {isLoadingTasks ? (
                  <p className="font-segoe-ui text-sm text-slate-500">Ładowanie zadań…</p>
                ) : tasks.length === 0 ? (
                  <p className="font-segoe-ui text-sm text-slate-500">
                    W tym sprincie nie ma niedokończonych zadań. Zostanie tylko zamknięty i zastąpiony nowym.
                  </p>
                ) : (
                  <>
                    <div className="mb-4 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                      {tasks.map((task) => (
                        <p key={task.id} className="truncate font-segoe-ui text-sm text-slate-800">
                          {task.name}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 font-segoe-ui text-sm text-slate-800">
                        <input
                          type="radio"
                          name="unfinished-task-destination"
                          className="mt-1"
                          checked={destination === 'next-sprint'}
                          onChange={() => setDestination('next-sprint')}
                        />
                        Przenieś do nowego sprintu
                      </label>
                      <label className="flex items-start gap-2 font-segoe-ui text-sm text-slate-800">
                        <input
                          type="radio"
                          name="unfinished-task-destination"
                          className="mt-1"
                          checked={destination === 'backlog'}
                          onChange={() => setDestination('backlog')}
                        />
                        Przenieś do backlogu
                      </label>
                    </div>
                  </>
                )}
              </fieldset>

              <p className="font-segoe-ui text-xs leading-4 text-slate-500">
                Operacja składa się z kilku żądań i nie jest atomowa. Jeśli któryś krok się nie powiedzie, widać będzie, co już zostało zapisane.
              </p>
            </>
          ) : null}

          {progress ? (
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between font-segoe-ui text-sm text-slate-700">
                  <span>{progress.message}</span>
                  <span>{percent}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Postęp zamykania sprintu"
                >
                  <div className="h-full rounded-full bg-scrumdone-blue-main transition-all" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <ol className="space-y-3">
                <li className="flex items-start gap-3 font-segoe-ui text-sm text-slate-800">
                  <StepMarker state={progress.close} />
                  Zamknięcie sprintu
                </li>
                <li className="flex items-start gap-3 font-segoe-ui text-sm text-slate-800">
                  <StepMarker state={progress.create} />
                  Utworzenie nowego sprintu
                </li>
                <li className="flex items-start gap-3 font-segoe-ui text-sm text-slate-800">
                  <StepMarker state={progress.move} />
                  Przeniesienie zadań
                  {progress.totalToMove > 0 ? ` (${progress.attempted} z ${progress.totalToMove})` : ''}
                </li>
              </ol>
            </div>
          ) : null}

          {runView.kind === 'success' ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-segoe-ui text-sm text-green-800">
              <p>Sprint został zamknięty. Utworzono „{runView.newSprintName}”.</p>
              <p className="mt-1">
                {runView.movedCount === 0
                  ? 'Nie było niedokończonych zadań do przeniesienia.'
                  : `Przeniesiono ${formatCount(runView.movedCount, PLURALS.tasks)} ${destinationLabel(runView.destination)}.`}
              </p>
            </div>
          ) : null}

          {runView.kind === 'partial' ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-segoe-ui text-sm text-amber-900">
                {runView.failure.stage === 'close' ? (
                  <p>Nie udało się zamknąć sprintu. Żadne zmiany nie zostały zapisane.</p>
                ) : null}
                {runView.failure.stage === 'create' ? (
                  <p>
                    Sprint został zamknięty, ale nie udało się utworzyć nowego sprintu. Niedokończone zadania nadal są w zamkniętym sprincie.
                  </p>
                ) : null}
                {runView.failure.stage === 'move' ? (
                  <p>
                    Sprint został zamknięty i utworzono „{runView.failure.newSprintName}”, ale nie udało się przenieść{' '}
                    {formatCount(runView.failure.failedTasks.length, PLURALS.tasksGenitive)}.
                    {runView.failure.movedCount > 0
                      ? ` Przeniesiono ${formatCount(runView.failure.movedCount, PLURALS.tasks)} ${destinationLabel(runView.failure.destination)}.`
                      : ''}
                  </p>
                ) : null}
                <p className="mt-2 text-amber-800">{runView.failure.message}</p>
              </div>
              {runView.failure.failedTasks.length > 0 ? (
                <ul className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-slate-200 px-3 py-2">
                  {runView.failure.failedTasks.map((task) => (
                    <li key={task.id} className="font-segoe-ui text-sm text-slate-800">
                      <span className="font-medium">{task.name}</span>
                      <span className="text-slate-500"> — {task.message}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
          {runView.kind === 'form' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoadingTasks || Boolean(loadError)}
                className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD] disabled:opacity-50"
              >
                Zamknij sprint
              </button>
            </>
          ) : null}

          {runView.kind === 'running' ? (
            <button
              type="button"
              disabled
              className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white opacity-60"
            >
              Trwa zapisywanie…
            </button>
          ) : null}

          {runView.kind === 'partial' ? (
            <>
              <button
                type="button"
                onClick={onFinished}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Zamknij
              </button>
              <button
                type="button"
                onClick={() => handleRetry(runView.failure)}
                className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD]"
              >
                Spróbuj ponownie
              </button>
            </>
          ) : null}

          {runView.kind === 'success' ? (
            <button
              type="button"
              onClick={onFinished}
              className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD]"
            >
              Gotowe
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CloseAndStartSprintDialog;
