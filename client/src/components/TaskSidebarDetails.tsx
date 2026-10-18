import { useEffect, useRef, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { TaskStatusDropdown } from './TaskStatusDropdown';
import { TaskAssigneesRow } from './TaskAssigneesRow';
import type { Assignment, UpdateAssignmentDto } from '../types/assignment';
import type { UserSummary } from '../types/user';
import { useQueryClient } from '@tanstack/react-query';
import { usePriorities } from '../hooks/useAssignments';
import { useProject } from '../hooks/useProject';
import { useSprints } from '../hooks/useSprints';
import { useUpdateAssignment } from '../hooks/useUpdateAssignment';
import { useUpdateAssignees } from '../hooks/useUpdateAssignees';

interface TaskSidebarDetailsProps {
  assignmentId: string;
  assignment: Assignment;
}

const TIME_ESTIMATE_MAX = 100;

const toDateInputValue = (date: string | null) =>
  date ? new Date(date).toISOString().slice(0, 10) : '';

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('pl-PL') : 'Brak';

const formatTimeEstimate = (value: number | null) => (value == null ? '' : `${value}h`);

const parseTimeEstimate = (raw: string): number | null | 'invalid' => {
  const normalized = raw.trim().replace(/h$/i, '').trim().replace(',', '.');
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : 'invalid';
};

const inputClassName =
  'w-36 rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 py-1.5 text-[13px] text-slate-800 outline-none focus:border-scrumdone-blue-main focus:bg-white disabled:opacity-60';

export const TaskSidebarDetails: React.FC<TaskSidebarDetailsProps> = ({ assignmentId, assignment }) => {
  const queryClient = useQueryClient();
  const { mutate: updateAssigneesMutation, isPending: isUpdatingAssignees } = useUpdateAssignees();
  const { data: project } = useProject(assignment.projectId);
  const teamMembers = project?.teamMembers ?? [];

  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [priorityDraft, setPriorityDraft] = useState('');
  const [sprintDraft, setSprintDraft] = useState('');
  const [timeEstimateDraft, setTimeEstimateDraft] = useState('');
  const [timeEstimateError, setTimeEstimateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: priorities = [] } = usePriorities();
  const { data: sprintsData } = useSprints(assignment.projectId);
  const sprints = sprintsData?.items ?? [];
  const isCurrentSprintListed = !assignment.sprintId || sprints.some((s) => s.id === assignment.sprintId);

  const { mutate: updateAssignment, isPending: isSaving } = useUpdateAssignment();

  const persistAssignees = (userIds: string[]) => {
    const peopleById = new Map<string, UserSummary>();
    for (const member of teamMembers) {
      peopleById.set(member.id, member);
    }
    for (const assignee of assignment.assignees) {
      peopleById.set(assignee.id, assignee);
    }

    const nextAssignees = userIds
      .map((id) => peopleById.get(id))
      .filter((person): person is UserSummary => Boolean(person));

    queryClient.setQueryData(['assignment', assignmentId], (old: Assignment | undefined) =>
      old ? { ...old, assignees: nextAssignees } : old,
    );

    updateAssigneesMutation(
      { id: assignmentId, data: { userIds } },
      {
        onSuccess: () => setSaveError(null),
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
          setSaveError('Nie udało się zaktualizować osób. Spróbuj ponownie.');
        },
      },
    );
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const resetDrafts = () => {
    setDueDateDraft(toDateInputValue(assignment.dueDate));
    setPriorityDraft(assignment.priority?.id ?? '');
    setSprintDraft(assignment.sprintId ?? '');
    setTimeEstimateDraft(formatTimeEstimate(assignment.timeEstimate));
    setTimeEstimateError(null);
    setSaveError(null);
  };

  const startEditing = () => {
    resetDrafts();
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const cancelEditing = () => {
    resetDrafts();
    setIsEditing(false);
  };

  const save = () => {
    const timeEstimate = parseTimeEstimate(timeEstimateDraft);
    if (timeEstimate === 'invalid') {
      setTimeEstimateError('Podaj liczbę godzin, np. 4 lub 4h.');
      return;
    }
    if (timeEstimate != null && timeEstimate > TIME_ESTIMATE_MAX) {
      setTimeEstimateError(`Maksymalnie ${TIME_ESTIMATE_MAX}h.`);
      return;
    }
    setTimeEstimateError(null);

    const data: UpdateAssignmentDto = {};
    if (dueDateDraft !== toDateInputValue(assignment.dueDate)) {
      data.dueDate = dueDateDraft ? new Date(dueDateDraft).toISOString() : null;
    }
    if (priorityDraft !== (assignment.priority?.id ?? '')) {
      data.priorityId = priorityDraft || null;
    }
    if (sprintDraft !== (assignment.sprintId ?? '')) {
      data.sprintId = sprintDraft || null;
    }
    if (timeEstimate !== assignment.timeEstimate) {
      data.timeEstimate = timeEstimate;
    }

    if (Object.keys(data).length === 0) {
      setIsEditing(false);
      setSaveError(null);
      return;
    }

    setSaveError(null);
    updateAssignment(
      { id: assignment.id, data },
      {
        onSuccess: () => setIsEditing(false),
        onError: () => setSaveError('Nie udało się zapisać zmian. Spróbuj ponownie.'),
      },
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      save();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TaskStatusDropdown assignment={assignment} />

      <div
        className={`rounded-xl border bg-white p-5 shadow-sm transition-colors ${
          isEditing
            ? 'border-scrumdone-blue-main ring-4 ring-scrumdone-blue-main/10'
            : 'border-slate-200'
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <div className="relative top-[5px]">
              <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
            </div>

            <h2 className="text-[20px] leading-[30px] font-medium text-black">Szczegóły</h2>

            {isEditing ? (
              <span className="text-sm font-medium text-scrumdone-blue-main">— tryb edycji</span>
            ) : null}
          </div>

          {isEditing ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XMarkIcon className="h-4 w-4" />
                Anuluj
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-scrumdone-blue-main px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#00A0DD] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckIcon className="h-4 w-4" />
                Zapisz
              </button>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Opcje szczegółów"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsMenuOpen((open) => !open)}
                className={`cursor-pointer rounded-md p-1 transition-colors ${
                  isMenuOpen
                    ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>

              {isMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-1 min-w-[100px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={startEditing}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edytuj
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-4 text-[14px]">
          <TaskAssigneesRow
            assignees={assignment.assignees ?? []}
            teamMembers={teamMembers}
            disabled={isUpdatingAssignees}
            onAssigneesChange={persistAssignees}
          />
          <DetailRow label="Projekt" value={assignment.projectName} />
          <DetailRow label="Utworzono" value={formatDate(assignment.createdAt)} />

          {isEditing ? (
            <>
              <div className="border-t border-slate-100" />

              <EditRow label="Termin" htmlFor="assignment-due-date">
                <input
                  id="assignment-due-date"
                  type="date"
                  value={dueDateDraft}
                  disabled={isSaving}
                  onChange={(event) => setDueDateDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className={inputClassName}
                />
              </EditRow>

              <EditRow label="Priorytet" htmlFor="assignment-priority">
                <select
                  id="assignment-priority"
                  value={priorityDraft}
                  disabled={isSaving}
                  onChange={(event) => setPriorityDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className={inputClassName}
                >
                  <option value="">Brak</option>
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </EditRow>

              <EditRow label="Sprint" htmlFor="assignment-sprint">
                <select
                  id="assignment-sprint"
                  value={sprintDraft}
                  disabled={isSaving}
                  onChange={(event) => setSprintDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className={inputClassName}
                >
                  <option value="">Brak (backlog)</option>
                  {!isCurrentSprintListed && assignment.sprintId ? (
                    <option value={assignment.sprintId}>{assignment.sprintName ?? 'Bez nazwy'}</option>
                  ) : null}
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name ?? 'Bez nazwy'}
                    </option>
                  ))}
                </select>
              </EditRow>

              <EditRow label="Czas estimacji" htmlFor="assignment-time-estimate">
                <div className="flex flex-col items-end">
                  <input
                    id="assignment-time-estimate"
                    type="text"
                    inputMode="decimal"
                    placeholder="np. 4h"
                    value={timeEstimateDraft}
                    disabled={isSaving}
                    onChange={(event) => {
                      setTimeEstimateDraft(event.target.value);
                      setTimeEstimateError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    className={inputClassName}
                  />
                  {timeEstimateError ? (
                    <p className="mt-1 text-xs text-red-600">{timeEstimateError}</p>
                  ) : null}
                </div>
              </EditRow>

              <DetailRow label="Wykonaj po" value="Brak danych" isPlaceholder />

              {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
            </>
          ) : (
            <>
              <DetailRow label="Termin" value={formatDate(assignment.dueDate)} isPlaceholder={!assignment.dueDate} />
              <DetailRow label="Priorytet" value={assignment.priority?.name ?? 'Brak'} isPlaceholder={!assignment.priority} />
              <DetailRow label="Sprint" value={assignment.sprintName ?? 'Brak (backlog)'} isPlaceholder={!assignment.sprintId} />
              <DetailRow
                label="Czas estimacji"
                value={formatTimeEstimate(assignment.timeEstimate) || 'Brak'}
                isPlaceholder={assignment.timeEstimate == null}
              />
              <DetailRow label="Wykonaj po" value="Brak danych" isPlaceholder />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, isPlaceholder }: { label: string, value: string, isPlaceholder?: boolean }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className={`font-medium text-right ${isPlaceholder ? "text-slate-400" : "text-slate-800"}`}>
      {value}
    </span>
  </div>
);

const EditRow = ({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4">
    <label htmlFor={htmlFor} className="pt-1.5 text-slate-500 shrink-0">
      {label}
    </label>
    {children}
  </div>
);
