import React, { useEffect, useState } from 'react'
import { ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useDroppable } from '@dnd-kit/core'
import { CalendarNoDeadlineTaskCard, type CalendarNoDeadlineTask } from './CalendarNoDeadlineTasks'

interface CalendarNoDeadlineDrawerProps {
    tasks: CalendarNoDeadlineTask[]
    title?: string
}

// Panel "bez deadline" na telefonie: przycisk przyklejony do dołu ekranu, który wysuwa szufladę z listą.
// Przycisk jest też celem upuszczenia - przeciągnięcie na niego zadania z listy dni usuwa termin.
const CalendarNoDeadlineDrawer: React.FC<CalendarNoDeadlineDrawerProps> = ({ tasks, title = 'Zadania bez deadline' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { setNodeRef, isOver } = useDroppable({
        id: 'calendar-no-deadline',
        data: { type: 'calendar-no-deadline' },
    })

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    return (
        <>
            <button
                ref={setNodeRef}
                type="button"
                onClick={() => setIsOpen(true)}
                aria-expanded={isOpen}
                className={`fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg transition-colors ${isOver ? 'border-scrumdone-blue-main bg-scrumdone-blue-200' : 'border-slate-200 bg-white'}`}
            >
                <span className="font-segoe-ui text-[14px] font-medium text-slate-900">{title}</span>
                <span className="flex items-center gap-2">
                    <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-900">
                        {tasks.length}
                    </span>
                    <ChevronUpIcon className="h-4 w-4 text-slate-500" />
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end bg-slate-900/35" onClick={() => setIsOpen(false)}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="calendar-no-deadline-drawer-title"
                        className="flex max-h-[80vh] w-full animate-drawer-up flex-col rounded-t-2xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
                        <div className="flex items-center justify-between px-4 py-3">
                            <h2 id="calendar-no-deadline-drawer-title" className="font-segoe-ui text-[18px] leading-7 font-medium text-slate-900">
                                {title} ({tasks.length})
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                                aria-label="Zamknij"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-6">
                            {tasks.length === 0 ? (
                                <p className="py-4 text-sm text-slate-500">Brak zadań bez terminu.</p>
                            ) : (
                                tasks.map((task) => <CalendarNoDeadlineTaskCard key={task.id} task={task} />)
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CalendarNoDeadlineDrawer
