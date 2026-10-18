import { useState, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Assignment } from '../../types/assignment';
import { useStatuses } from '../../hooks/assignments/useAssignments';
import { useUpdateAssignment } from '../../hooks/assignments/useUpdateAssignment';

interface TaskStatusDropdownProps {
    assignment: Assignment;
}

export const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ assignment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: statuses = [], isLoading } = useStatuses();
    const { mutate: updateAssignment, isPending } = useUpdateAssignment();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectStatus = (statusId: string) => {
        setIsOpen(false);
        if (statusId === assignment.status.id) {
            return;
        }

        setError(null);
        updateAssignment(
            { id: assignment.id, data: { statusId } },
            { onError: () => setError('Nie udało się zmienić statusu.') },
        );
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative w-full" ref={dropdownRef}>
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    disabled={isPending}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex w-full items-center justify-between gap-2 
                        rounded-lg bg-[#F1F2F4] px-4 py-2 
                        text-[14px] font-medium text-slate-700 
                        hover:bg-[#E2E4E9] transition-all cursor-pointer
                        disabled:cursor-not-allowed disabled:opacity-60
                    `}
                >
                    <span className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: assignment.status.hexColor }}
                        />
                        {assignment.status.name}
                    </span>
                    <ChevronDownIcon 
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {isOpen && (
                    <div
                        role="listbox"
                        className="absolute left-0 mt-1 w-full rounded-lg bg-white shadow-xl border border-slate-200 z-50 overflow-hidden"
                    >
                        <div className="py-1">
                            {isLoading ? (
                                <p className="px-4 py-2.5 text-sm text-slate-400">Ładowanie...</p>
                            ) : (
                                statuses.map((status) => {
                                    const isSelected = status.id === assignment.status.id;
                                    return (
                                        <button
                                            key={status.id}
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => selectStatus(status.id)}
                                            className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: status.hexColor }}
                                                />
                                                {status.name}
                                            </span>
                                            {isSelected ? (
                                                <CheckIcon className="h-4 w-4 text-scrumdone-blue-main" />
                                            ) : null}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
    );
};
