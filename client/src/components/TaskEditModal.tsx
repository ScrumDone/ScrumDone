import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import { type PersonFilter } from './calendarPeopleFilter';
import { usePriorities, useStatuses } from '../hooks/useAssignments';
import { useUpdateAssignment } from '../hooks/useUpdateAssignment';
import { useUpdateAssignees } from '../hooks/useUpdateAssignees';
import type { UpdateAssignmentDto } from '../types/assignment';

export type TaskEditDraft = {
  id: string;
  name: string;
  description: string;
  statusId: string;
  priorityId: string;
  dueDate: string;
  assigneeIds: string[];
};

type TaskEditModalProps = {
  isOpen: boolean;
  task: TaskEditDraft | null;
  teamMembers: PersonFilter[];
  onClose: () => void;
};

const haveSameAssigneeIds = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();

  return sortedLeft.every((id, index) => id === sortedRight[index]);
};

const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, task, teamMembers, onClose }) => {
  const { data: statuses } = useStatuses();
  const { data: priorities } = usePriorities();
  const { mutate: updateAssignment, isPending: isUpdatingAssignment } = useUpdateAssignment();
  const { mutate: updateAssignees, isPending: isUpdatingAssignees } = useUpdateAssignees();

  const [formData, setFormData] = useState<TaskEditDraft>({
    id: '',
    name: '',
    description: '',
    statusId: '',
    priorityId: '',
    dueDate: '',
    assigneeIds: [],
  });

  const isPending = isUpdatingAssignment || isUpdatingAssignees;

  useEffect(() => {
    if (!task) return;
    setFormData(task);
  }, [task]);

  if (!isOpen || !task) return null;

  const toggleAssignee = (memberId: string) => {
    setFormData((prev) => {
      const isAlreadyAssigned = prev.assigneeIds.includes(memberId);
      return {
        ...prev,
        assigneeIds: isAlreadyAssigned
          ? prev.assigneeIds.filter((id) => id !== memberId)
          : [...prev.assigneeIds, memberId],
      };
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Nazwa zadania jest wymagana');
      return;
    }

    const payload: UpdateAssignmentDto = {
      name: formData.name.trim(),
      description: formData.description,
      statusId: formData.statusId || statuses?.[0]?.id || '',
      priorityId: formData.priorityId || priorities?.[0]?.id || '',
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
    };

    const assigneesChanged = !haveSameAssigneeIds(formData.assigneeIds, task.assigneeIds);

    if (import.meta.env.DEV) {
      console.log('[Kanban] Zapis edycji zadania:', formData.id, payload, {
        assigneeIds: formData.assigneeIds,
        assigneesChanged,
      });
    }

    const finishSave = () => {
      if (assigneesChanged) {
        updateAssignees(
          { id: formData.id, data: { userIds: formData.assigneeIds } },
          {
            onSuccess: () => onClose(),
            onError: (error) => {
              console.error('Błąd zmiany osoby przypisanej:', error);
              alert('Zadanie zapisane, ale nie udało się zmienić osoby przypisanej.');
            },
          },
        );
        return;
      }

      onClose();
    };

    updateAssignment(
      { id: formData.id, data: payload },
      {
        onSuccess: finishSave,
        onError: (error) => {
          console.error('Błąd edycji zadania:', error);
          alert('Wystąpił błąd podczas zapisywania zadania.');
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 font-segoe-ui">
      <div
        className="relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-[12px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-8 pt-6">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900">Edytuj zadanie</h2>
            <p className="text-[14px] text-slate-500">Zaktualizuj informacje o zadaniu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-8 py-6">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Tytuł zadania</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main"
            />
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Opis (opcjonalnie)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main"
            />
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Osoba przypisana</label>
            <div className="rounded-[8px] border border-slate-200 p-1">
              <div className="max-h-36 space-y-1 overflow-y-auto px-2">
                {teamMembers.length === 0 ? (
                  <p className="px-2 py-2 text-[13px] text-slate-500">Brak członków zespołu w projekcie.</p>
                ) : (
                  teamMembers.map((member) => (
                    <label key={member.id} className="flex cursor-pointer items-center gap-3 rounded-md py-1.5 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-scrumdone-blue-main focus:ring-scrumdone-blue-main"
                        checked={formData.assigneeIds.includes(member.id)}
                        onChange={() => toggleAssignee(member.id)}
                      />
                      <Avatar initials={member.initials} size="xs" bgClassName="bg-[#00BFFF]" textClassName="text-white" />
                      <span className="text-[14px] text-slate-700">{member.fullName}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-slate-900">Status</label>
              <div className="relative">
                <select
                  value={formData.statusId}
                  onChange={(e) => setFormData({ ...formData, statusId: e.target.value })}
                  className="w-full appearance-none rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main"
                >
                  {statuses?.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-slate-900">Priorytet</label>
              <div className="relative">
                <select
                  value={formData.priorityId}
                  onChange={(e) => setFormData({ ...formData, priorityId: e.target.value })}
                  className="w-full appearance-none rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main"
                >
                  {priorities?.map((priority) => (
                    <option key={priority.id} value={priority.id}>{priority.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-medium text-slate-900">Deadline</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded-[8px] border-none bg-[#F5F6F8] px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-scrumdone-blue-main"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] px-5 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-[8px] bg-scrumdone-blue-main px-5 py-2 text-[14px] font-medium text-white hover:bg-[#00A0DD] disabled:opacity-60"
          >
            {isPending ? 'Zapisywanie…' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
