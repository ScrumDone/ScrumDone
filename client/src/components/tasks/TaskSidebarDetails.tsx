import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { TaskStatusDropdown } from './TaskStatusDropdown';
import { TaskAssigneesRow } from './TaskAssigneesRow';
import type { Assignment, UpdateAssignmentDto } from '../../types/assignment';
import type { UserSummary } from '../../types/user';
import { usePriorities } from '../../hooks/assignments/useAssignments';
import { useProject } from '../../hooks/projects/useProject';
import { useSprints } from '../../hooks/sprints/useSprints';
import { useUpdateAssignment } from '../../hooks/assignments/useUpdateAssignment';
import { useUpdateAssignees } from '../../hooks/assignments/useUpdateAssignees';
import { formatSprintDisplayName } from '../../utils/sprintDisplay';

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

const sameAssigneeIds = (left: readonly { id: string }[], right: readonly { id: string }[]) => {
  if (left.length !== right.length) return false;
  const rightIds = new Set(right.map((person) => person.id));
  return left.every((person) => rightIds.has(person.id));
};

const inputClassName =
  'w-36 rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 py-1.5 text-[13px] text-slate-800 outline-none focus:border-scrumdone-blue-main focus:bg-white disabled:opacity-60';

export const TaskSidebarDetails: React.FC<TaskSidebarDetailsProps> = ({ assignmentId, assignment }) => {
  const { mutateAsync: updateAssignees, isPending: isUpdatingAssignees } = useUpdateAssignees();
  const { data: project } = useProject(assignment.projectId);
  const teamMembers = project?.teamMembers ?? [];
  const assigneeOptions = useMemo(() => {
    const byId = new Map<string, UserSummary>();
    for (const member of teamMembers) {
      byId.set(member.id, member);
    }
    for (const assignee of assignment.assignees ?? []) {
      if (!byId.has(assignee.id)) {
        byId.set(assignee.id, assignee);
      }
    }
    return [...byId.values()];
  }, [teamMembers, assignment.assignees]);

  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [priorityDraft, setPriorityDraft] = useState('');
  const [sprintDraft, setSprintDraft] = useState('');
  const [timeEstimateDraft, setTimeEstimateDraft] = useState('');
  const [assigneesDraft, setAssigneesDraft] = useState<UserSummary[]>([]);
  const [timeEstimateError, setTimeEstimateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: priorities = [] } = usePriorities();
  const { data: sprintsData } = useSprints(assignment.projectId);
  const sprints = sprintsData?.items ?? [];
  const isCurrentSprintListed = !assignment.sprintId || sprints.some((s) => s.id === assignment.sprintId);
  const assignedSprint = assignment.sprintId
    ? sprints.find((sprint) => sprint.id === assignment.sprintId)
    : undefined;
  const assignedSprintLabel = !assignment.sprintId
    ? 'Brak (backlog)'
    : formatSprintDisplayName(assignedSprint ?? { name: assignment.sprintName });

  const { mutateAsync: updateAssignment, isPending: isSaving } = useUpdateAssignment();
  const isPersisting = isSaving || isUpdatingAssignees;

  const updateAssigneesDraft = (userIds: string[]) => {
    const peopleById = new Map<string, UserSummary>();
    for (const member of teamMembers) {
      peopleById.set(member.id, member);
    }
    for (const assignee of assignment.assignees ?? []) {
      peopleById.set(assignee.id, assignee);
    }
    for (const assignee of assigneesDraft) {
      peopleById.set(assignee.id, assignee);
    }

    setAssigneesDraft(
      userIds
        .map((id) => peopleById.get(id))
        .filter((person): person is UserSummary => Boolean(person)),
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
    setAssigneesDraft([...(assignment.assignees ?? [])]);
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

  const save = async () => {
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

    const originalAssignees = assignment.assignees ?? [];
    const assigneesChanged = !sameAssigneeIds(assigneesDraft, originalAssignees);
    const hasFieldChanges = Object.keys(data).length > 0;

    if (!hasFieldChanges && !assigneesChanged) {
      setIsEditing(false);
      setSaveError(null);
      return;
    }

    setSaveError(null);
    const requests: Promise<unknown>[] = [];
    if (hasFieldChanges) {
      requests.push(updateAssignment({ id: assignment.id, data }));
    }
    if (assigneesChanged) {
      requests.push(
        updateAssignees({
          id: assignmentId,
          data: { userIds: assigneesDraft.map((person) => person.id) },
        }),
      );
    }

    const results = await Promise.allSettled(requests);
    if (results.every((result) => result.status === 'fulfilled')) {
      setIsEditing(false);
      return;
    }

    setSaveError('Nie udało się zapisać zmian. Spróbuj ponownie.');
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

            {/* {isEditing ? (
              <span className="text-sm font-medium text-scrumdone-blue-main">— tryb edycji</span>
            ) : null} */}
          </div>

          {isEditing ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isPersisting}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XMarkIcon className="h-4 w-4" />
                Anuluj
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isPersisting}
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
            assignees={isEditing ? assigneesDraft : (assignment.assignees ?? [])}
            teamMembers={assigneeOptions}
            isEditing={isEditing}
            disabled={isPersisting}
            onAssigneesChange={updateAssigneesDraft}
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
                  disabled={isPersisting}
                  onChange={(event) => setDueDateDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className={inputClassName}
                />
              </EditRow>

              <EditRow label="Priorytet" htmlFor="assignment-priority">
                <select
                  id="assignment-priority"
                  value={priorityDraft}
                  disabled={isPersisting}
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
                  disabled={isPersisting}
                  onChange={(event) => setSprintDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className={inputClassName}
                >
                  <option value="">Brak (backlog)</option>
                  {!isCurrentSprintListed && assignment.sprintId ? (
                    <option value={assignment.sprintId}>{assignedSprintLabel}</option>
                  ) : null}
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {formatSprintDisplayName(sprint)}
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
                    disabled={isPersisting}
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
              <DetailRow label="Sprint" value={assignedSprintLabel} isPlaceholder={!assignment.sprintId} />
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
