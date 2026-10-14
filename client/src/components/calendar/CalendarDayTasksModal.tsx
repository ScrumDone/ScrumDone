import React, { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { XMarkIcon } from '@heroicons/react/24/outline'
import CalendarTaskItem from './CalendarTaskItem'
import { useCalendarDayAssignments, type CalendarAssignmentFilters } from '../../hooks/calendar/useCalendarAssignments'
import { assignmentToCalendarTask } from '../../lib/assignmentMappers'

interface CalendarDayTasksModalProps {
    // Klucz dnia yyyy-MM-dd; null = okno zamknięte
    dayKey: string | null
    filters: CalendarAssignmentFilters
    onClose: () => void
}

// Pełna lista zadań jednego dnia z doładowywaniem kolejnych stron
const CalendarDayTasksModal: React.FC<CalendarDayTasksModalProps> = ({ dayKey, filters, onClose }) => {
    const {
        data,
        isLoading,
        isError,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useCalendarDayAssignments(dayKey, filters)

    const tasks = useMemo(
        () => data?.pages.flatMap((page) => page.items).map((assignment) => assignmentToCalendarTask(assignment)) ?? [],
        [data?.pages],
    )
    const totalCount = data?.pages[0] ? Number(data.pages[0].totalCount) : undefined

    if (!dayKey) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="calendar-day-tasks-title"
                className="flex max-h-[75vh] w-full max-w-110 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div>
                        <h2 id="calendar-day-tasks-title" className="font-segoe-ui text-[18px] font-semibold text-slate-900">
                            {format(parseISO(dayKey), 'EEEE, d MMMM yyyy', { locale: pl })}
                        </h2>
                        {totalCount !== undefined ? (
                            <p className="text-sm text-slate-500">
                                Zadania z terminem w tym dniu: {totalCount}
                            </p>
                        ) : null}
                    </div>
                    <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Zamknij">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-4">
                    {isLoading ? (
                        <p className="py-6 text-sm text-slate-500 animate-pulse">Ładowanie zadań...</p>
                    ) : isError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            Nie udało się pobrać zadań{error?.message ? `: ${error.message}` : '.'}
                        </div>
                    ) : tasks.length === 0 ? (
                        <p className="py-6 text-sm text-slate-500">Brak zadań w tym dniu.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tasks.map((task) => (
                                <CalendarTaskItem
                                    key={task.id}
                                    id={task.id}
                                    title={task.title}
                                    colorVariant={task.colorVariant}
                                    priorityHexColor={task.priorityHexColor}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
                    <p className="text-[12px] text-slate-400">
                        {totalCount !== undefined ? `Wczytano ${tasks.length} z ${totalCount}` : null}
                    </p>
                    {hasNextPage ? (
                        <button
                            type="button"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            {isFetchingNextPage ? 'Ładowanie…' : 'Załaduj więcej'}
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default CalendarDayTasksModal
