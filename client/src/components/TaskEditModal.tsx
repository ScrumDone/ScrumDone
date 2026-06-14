import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePriorities, useStatuses } from '../hooks/useAssignments';
import { useUpdateAssignment } from '../hooks/useUpdateAssignment';
import type { UpdateAssignmentDto } from '../types/assignment';

export type TaskEditDraft = {
  id: string;
  name: string;
  description: string;
  statusId: string;
  priorityId: string;
  dueDate: string;
};

type TaskEditModalProps = {
  isOpen: boolean;
  task: TaskEditDraft | null;
  onClose: () => void;
};

const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, task, onClose }) => {
  const { data: statuses } = useStatuses();
  const { data: priorities } = usePriorities();
  const { mutate: updateAssignment, isPending } = useUpdateAssignment();

  const [formData, setFormData] = useState<TaskEditDraft>({
    id: '',
    name: '',
    description: '',
    statusId: '',
    priorityId: '',
    dueDate: '',
  });

  useEffect(() => {
    if (!task) return;
    setFormData(task);
  }, [task]);

  if (!isOpen || !task) return null;

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

    if (import.meta.env.DEV) {
      console.log('[Kanban] Zapis edycji zadania:', formData.id, payload);
    }

    updateAssignment(
      { id: formData.id, data: payload },
      {
        onSuccess: () => onClose(),
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
